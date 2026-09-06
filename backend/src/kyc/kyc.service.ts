import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KycStatus } from '@veya/shared';
import { KycSubmission } from './entities/kyc-submission.entity';
import { User } from '../users/entities/user.entity';
import { AdminUser } from '../admin-users/entities/admin-user.entity';
import { UsersService } from '../users/users.service';
import { PaginatedResultDto } from '../common/dto/pagination.dto';
import {
  AdminListKycQueryDto,
  CreateKycSubmissionDto,
} from './dto/kyc.dto';

/** Field names accepted from the multipart KYC upload. */
export const KYC_FILE_FIELDS = ['idFront', 'idBack', 'selfie'] as const;

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(KycSubmission)
    private readonly submissions: Repository<KycSubmission>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Creates a KYC submission from user input and already-stored upload paths.
   * Only one pending submission may exist at a time.
   */
  async submit(
    user: User,
    dto: CreateKycSubmissionDto,
    documentFiles: string[],
  ): Promise<KycSubmission> {
    if (documentFiles.length === 0) {
      throw new BadRequestException('At least one supporting document is required');
    }

    const pending = await this.submissions.findOne({
      where: { userId: user.id, status: KycStatus.PENDING },
    });
    if (pending) {
      throw new ConflictException(
        'A KYC submission is already pending review',
      );
    }

    const submission = this.submissions.create({
      userId: user.id,
      level: dto.level,
      status: KycStatus.PENDING,
      fullName: dto.fullName,
      documentType: dto.documentType,
      documentNumber: dto.documentNumber,
      country: dto.country,
      dateOfBirth: dto.dateOfBirth,
      documentFiles,
    });
    const saved = await this.submissions.save(submission);
    await this.usersService.setKycPending(user.id);
    return saved;
  }

  /** Returns the authenticated user's submissions, newest first. */
  listMine(userId: string): Promise<KycSubmission[]> {
    return this.submissions.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(
    query: AdminListKycQueryDto,
  ): Promise<PaginatedResultDto<KycSubmission>> {
    const qb = this.submissions
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.user', 'user')
      .orderBy('submission.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('submission.status = :status', { status: query.status });
    }
    if (query.level !== undefined) {
      qb.andWhere('submission.level = :level', { level: query.level });
    }
    if (query.search) {
      qb.andWhere(
        '(user.user_code ILIKE :search OR submission.full_name ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.skip(query.skip).take(query.take);
    const [items, total] = await qb.getManyAndCount();
    return new PaginatedResultDto(items, total, query.page, query.pageSize);
  }

  async findOne(id: string): Promise<KycSubmission> {
    const submission = await this.submissions.findOne({
      where: { id },
      relations: { user: true, reviewedBy: true },
    });
    if (!submission) {
      throw new NotFoundException('KYC submission not found');
    }
    return submission;
  }

  /** Approves a pending submission and raises the user's KYC level. */
  async approve(admin: AdminUser, id: string): Promise<KycSubmission> {
    const submission = await this.findOne(id);
    if (submission.status !== KycStatus.PENDING) {
      throw new ConflictException(
        `Submission is already ${submission.status}`,
      );
    }

    submission.status = KycStatus.APPROVED;
    submission.reviewedById = admin.id;
    submission.reviewedAt = new Date();
    submission.rejectReason = null;
    const saved = await this.submissions.save(submission);
    await this.usersService.setKycApproved(submission.userId, submission.level);
    return saved;
  }

  /** Rejects a pending submission with a mandatory reason. */
  async reject(
    admin: AdminUser,
    id: string,
    reason: string,
  ): Promise<KycSubmission> {
    const submission = await this.findOne(id);
    if (submission.status !== KycStatus.PENDING) {
      throw new ConflictException(
        `Submission is already ${submission.status}`,
      );
    }

    submission.status = KycStatus.REJECTED;
    submission.reviewedById = admin.id;
    submission.reviewedAt = new Date();
    submission.rejectReason = reason;
    const saved = await this.submissions.save(submission);
    await this.usersService.setKycRejected(submission.userId);
    return saved;
  }
}
