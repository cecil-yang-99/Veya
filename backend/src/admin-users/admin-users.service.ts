import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AdminStatus } from '@veya/shared';
import { AdminUser } from './entities/admin-user.entity';
import { PaginatedResultDto } from '../common/dto/pagination.dto';
import {
  AdminListAdminsQueryDto,
  CreateAdminUserDto,
  UpdateAdminUserDto,
} from './dto/admin-user.dto';

const BCRYPT_ROUNDS = 10;

/**
 * Administrator account management. All operations require the
 * `super_admin` role (enforced at controller level).
 */
@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly admins: Repository<AdminUser>,
  ) {}

  private hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
  }

  /** Strips the password hash before returning an administrator record. */
  private toSafe(admin: AdminUser): Omit<AdminUser, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...safe } = admin;
    return safe;
  }

  async create(dto: CreateAdminUserDto) {
    const existing = await this.admins.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const admin = this.admins.create({
      username: dto.username,
      email: dto.email ?? null,
      passwordHash: await this.hashPassword(dto.password),
      role: dto.role,
      status: AdminStatus.ACTIVE,
    });
    const saved = await this.admins.save(admin);
    return this.toSafe(saved);
  }

  async findAll(
    query: AdminListAdminsQueryDto,
  ): Promise<PaginatedResultDto<Omit<AdminUser, 'passwordHash'>>> {
    const qb = this.admins
      .createQueryBuilder('admin')
      .orderBy('admin.created_at', 'DESC');

    if (query.search) {
      qb.where('(admin.username ILIKE :search OR admin.email ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }
    if (query.role) {
      qb.andWhere('admin.role = :role', { role: query.role });
    }
    if (query.status) {
      qb.andWhere('admin.status = :status', { status: query.status });
    }

    qb.skip(query.skip).take(query.take);
    const [items, total] = await qb.getManyAndCount();
    return new PaginatedResultDto(
      items.map((item) => this.toSafe(item)),
      total,
      query.page,
      query.pageSize,
    );
  }

  async findOne(id: string): Promise<Omit<AdminUser, 'passwordHash'>> {
    const admin = await this.admins.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }
    return this.toSafe(admin);
  }

  /** Updates email/role. An administrator may not change their own role. */
  async update(
    actorId: string,
    id: string,
    dto: UpdateAdminUserDto,
  ): Promise<Omit<AdminUser, 'passwordHash'>> {
    const admin = await this.admins.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }
    if (dto.role && dto.role !== admin.role && actorId === id) {
      throw new ForbiddenException('You cannot change your own role');
    }

    if (dto.email !== undefined) {
      admin.email = dto.email;
    }
    if (dto.role !== undefined) {
      admin.role = dto.role;
    }
    const saved = await this.admins.save(admin);
    return this.toSafe(saved);
  }

  /** Enables/disables an account. Self-deactivation is blocked. */
  async setStatus(
    actorId: string,
    id: string,
    status: AdminStatus,
  ): Promise<Omit<AdminUser, 'passwordHash'>> {
    if (actorId === id) {
      throw new BadRequestException(
        'You cannot change your own account status',
      );
    }
    const admin = await this.admins.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }
    admin.status = status;
    const saved = await this.admins.save(admin);
    return this.toSafe(saved);
  }

  /** Resets another account's password. Self-reset goes through a dedicated flow. */
  async resetPassword(
    actorId: string,
    id: string,
    newPassword: string,
  ): Promise<{ success: true }> {
    if (actorId === id) {
      throw new BadRequestException(
        'Use the self-service password change for your own account',
      );
    }
    const admin = await this.admins.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Administrator not found');
    }
    admin.passwordHash = await this.hashPassword(newPassword);
    await this.admins.save(admin);
    return { success: true };
  }
}
