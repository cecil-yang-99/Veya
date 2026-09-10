import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from '../users/entities/user.entity';
import { WalletsService } from './wallets.service';
import { WalletsAdminController } from './wallets-admin.controller';
import { WalletsUserController } from './wallets-user.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, User]), UsersModule],
  controllers: [WalletsAdminController, WalletsUserController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
