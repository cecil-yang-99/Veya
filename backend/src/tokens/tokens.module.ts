import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { TokensPublicController } from './tokens-public.controller';
import { TokensService } from './tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  controllers: [TokensPublicController],
  providers: [TokensService],
  exports: [TokensService, TypeOrmModule],
})
export class TokensModule {}
