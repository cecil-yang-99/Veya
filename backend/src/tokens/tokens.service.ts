import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenStatus } from '@veya/shared';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private readonly tokens: Repository<Token>,
  ) {}

  findActive(): Promise<Token[]> {
    return this.tokens.find({
      where: { status: TokenStatus.ACTIVE },
      order: { sortOrder: 'ASC', symbol: 'ASC' },
    });
  }

  async findBySymbol(symbol: string): Promise<Token> {
    const token = await this.tokens.findOne({
      where: { symbol: symbol.trim().toUpperCase(), status: TokenStatus.ACTIVE },
    });
    if (!token) {
      throw new NotFoundException('Token not found');
    }
    return token;
  }
}
