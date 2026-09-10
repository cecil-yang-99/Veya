import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../tokens/entities/token.entity';
import { UserTransaction } from '../transactions/entities/user-transaction.entity';
import { AssetBalance } from './entities/asset-balance.entity';
import { AssetsUserController } from './assets-user.controller';
import { AssetsService } from './assets.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssetBalance, Token, UserTransaction])],
  controllers: [AssetsUserController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
