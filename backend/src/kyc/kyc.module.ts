import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycSubmission } from './entities/kyc-submission.entity';
import { User } from '../users/entities/user.entity';
import { KycService } from './kyc.service';
import { KycUserController } from './kyc-user.controller';
import { KycAdminController } from './kyc-admin.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([KycSubmission, User]), UsersModule],
  controllers: [KycUserController, KycAdminController],
  providers: [KycService],
})
export class KycModule {}
