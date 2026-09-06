import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { KycSubmission } from '../kyc/entities/kyc-submission.entity';
import { UsersService } from './users.service';
import { UsersAdminController } from './users-admin.controller';
import { UsersProfileController } from './users-profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Wallet, KycSubmission])],
  controllers: [UsersAdminController, UsersProfileController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
