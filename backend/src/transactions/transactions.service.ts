import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetsService } from '../assets/assets.service';
import { PaginatedResultDto } from '../common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';
import { UserTransactionsQueryDto } from './dto/user-transactions-query.dto';
import { UserTransaction } from './entities/user-transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(UserTransaction)
    private readonly transactions: Repository<UserTransaction>,
    private readonly assetsService: AssetsService,
  ) {}

  async listForUser(
    user: User,
    query: UserTransactionsQueryDto,
  ): Promise<PaginatedResultDto<UserTransaction>> {
    await this.assetsService.ensureSandboxPortfolio(user.id);
    const qb = this.transactions
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.fromToken', 'fromToken')
      .leftJoinAndSelect('transaction.toToken', 'toToken')
      .leftJoinAndSelect('transaction.wallet', 'wallet')
      .where('transaction.user_id = :userId', { userId: user.id })
      .orderBy('transaction.createdAt', 'DESC');

    if (query.type) {
      qb.andWhere('transaction.type = :type', { type: query.type });
    }
    if (query.status) {
      qb.andWhere('transaction.status = :status', { status: query.status });
    }

    qb.skip(query.skip).take(query.take);
    const [items, total] = await qb.getManyAndCount();
    return new PaginatedResultDto(items, total, query.page, query.pageSize);
  }

  async getForUser(user: User, id: string): Promise<UserTransaction> {
    await this.assetsService.ensureSandboxPortfolio(user.id);
    const transaction = await this.transactions.findOne({
      where: { id, userId: user.id },
      relations: { fromToken: true, toToken: true, wallet: true },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }
}
