import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { KycLevel, KycStatus, UserStatus } from '@veya/shared';
import { User } from './entities/user.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { KycSubmission } from '../kyc/entities/kyc-submission.entity';
import {
  PaginatedResultDto,
} from '../common/dto/pagination.dto';
import { AdminListUsersQueryDto } from './dto/admin-users-query.dto';

export interface UserDetail extends User {
  wallets: Wallet[];
  latestKyc: KycSubmission | null;
}

/**
 * Business logic for platform end users: provisioning on first wallet
 * sign-in, admin listing/detail, status management, and KYC state updates.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Wallet)
    private readonly wallets: Repository<Wallet>,
    @InjectRepository(KycSubmission)
    private readonly kycSubmissions: Repository<KycSubmission>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Creates a provisional user for a first-time wallet sign-in.
   * The public user code is derived from the current row count.
   */
  async createProvisionalUser(): Promise<User> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const count = await this.users.count();
      const userCode = `VEYA-${String(count + 1 + attempt).padStart(6, '0')}`;
      const existing = await this.users.findOne({ where: { userCode } });
      if (existing) {
        continue;
      }
      const user = this.users.create({
        userCode,
        nickname: null,
        status: UserStatus.ACTIVE,
        kycLevel: KycLevel.NONE,
        kycStatus: KycStatus.NONE,
      });
      return this.users.save(user);
    }
    throw new BadRequestException('Could not allocate a user code; retry');
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.users.update(userId, { lastLoginAt: new Date() });
  }

  // -------------------------------------------------------------------------
  // Admin operations
  // -------------------------------------------------------------------------

  async findAll(
    query: AdminListUsersQueryDto,
  ): Promise<PaginatedResultDto<User>> {
    const qb = this.users
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('user.status = :status', { status: query.status });
    }
    if (query.kycStatus) {
      qb.andWhere('user.kyc_status = :kycStatus', {
        kycStatus: query.kycStatus,
      });
    }
    if (query.kycLevel !== undefined) {
      qb.andWhere('user.kyc_level = :kycLevel', { kycLevel: query.kycLevel });
    }
    if (query.search) {
      qb.andWhere(
        '(user.user_code ILIKE :search OR user.nickname ILIKE :search OR user.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.skip(query.skip).take(query.take);
    const [items, total] = await qb.getManyAndCount();
    return new PaginatedResultDto(items, total, query.page, query.pageSize);
  }

  async getDetail(id: string): Promise<UserDetail> {
    const user = await this.findById(id);
    const [wallets, latestKyc] = await Promise.all([
      this.wallets.find({
        where: { userId: id },
        order: { isPrimary: 'DESC', createdAt: 'DESC' },
      }),
      this.kycSubmissions.findOne({
        where: { userId: id },
        order: { createdAt: 'DESC' },
      }),
    ]);
    return { ...user, wallets, latestKyc };
  }

  async setStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.findById(id);
    user.status = status;
    return this.users.save(user);
  }

  // -------------------------------------------------------------------------
  // KYC state transitions (called by the KYC module after review)
  // -------------------------------------------------------------------------

  /** Marks the user KYC-approved and raises the verification tier. */
  async setKycApproved(userId: string, level: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      user.kycStatus = KycStatus.APPROVED;
      user.kycLevel = Math.max(user.kycLevel, level);
      await manager.save(user);
    });
  }

  /** Marks the user KYC-rejected (existing approved tier is retained). */
  async setKycRejected(userId: string): Promise<void> {
    await this.users.update(userId, { kycStatus: KycStatus.REJECTED });
  }

  /** Marks the user as having a pending KYC submission. */
  async setKycPending(userId: string): Promise<void> {
    await this.users.update(userId, { kycStatus: KycStatus.PENDING });
  }
}
