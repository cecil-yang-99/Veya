import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetsModule } from '../assets/assets.module';
import { UserTransaction } from './entities/user-transaction.entity';
import { TransactionsUserController } from './transactions-user.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserTransaction]),
    forwardRef(() => AssetsModule),
  ],
  controllers: [TransactionsUserController],
  providers: [TransactionsService],
  exports: [TransactionsService, TypeOrmModule],
})
export class TransactionsModule {}
