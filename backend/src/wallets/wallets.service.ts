import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { verifyMessage } from 'ethers';
import { Repository } from 'typeorm';
import { ChainType } from '@veya/shared';
import { Wallet } from './entities/wallet.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { PaginatedResultDto } from '../common/dto/pagination.dto';
import { AdminListWalletsQueryDto } from './dto/admin-wallets-query.dto';

/**
 * Builds the human-readable message that users sign for wallet authentication.
 * The nonce binds the signature to a single challenge and prevents replay.
 */
export function buildSignInMessage(address: string, nonce: string): string {
  return [
    'Welcome to Veya!',
    '',
    'Sign this message to prove you own this wallet.',
    '',
    `Wallet: ${address}`,
    `Nonce: ${nonce}`,
  ].join('\n');
}

/** Development-only signature payload used by the React Native MVP. */
export function buildMockSignInSignaturePayload(
  address: string,
  nonce: string,
): string {
  return `veya-dev-signature:${address}:${nonce}`;
}

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly wallets: Repository<Wallet>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  /** Validates and normalizes an EVM address to lower case. */
  normalizeAddress(address: string): string {
    return address.trim().toLowerCase();
  }

  // -------------------------------------------------------------------------
  // Wallet-signature authentication
  // -------------------------------------------------------------------------

  /**
   * Issues a one-time sign-in nonce for an address. Provisions a user and a
   * wallet record on first sign-in so the nonce has somewhere to live.
   */
  async issueNonce(rawAddress: string): Promise<{ address: string; nonce: string; message: string }> {
    const address = this.normalizeAddress(rawAddress);

    let wallet = await this.wallets.findOne({
      where: { address, chainType: ChainType.EVM },
    });

    if (!wallet) {
      const user = await this.usersService.createProvisionalUser();
      wallet = this.wallets.create({
        userId: user.id,
        address,
        chainType: ChainType.EVM,
        isPrimary: true,
      });
    }

    wallet.signInNonce = randomUUID();
    await this.wallets.save(wallet);

    return {
      address,
      nonce: wallet.signInNonce,
      message: buildSignInMessage(address, wallet.signInNonce),
    };
  }

  /**
   * Verifies a signed nonce. Returns the wallet (with its user) when the
   * signature is valid; throws on any mismatch or stale challenge.
   */
  async verifySignature(
    rawAddress: string,
    signature: string,
  ): Promise<{ wallet: Wallet; user: User }> {
    const address = this.normalizeAddress(rawAddress);
    const wallet = await this.wallets.findOne({
      where: { address, chainType: ChainType.EVM },
      relations: { user: true },
    });

    if (!wallet || !wallet.signInNonce) {
      throw new UnauthorizedException(
        'No pending sign-in challenge for this wallet; request a nonce first',
      );
    }

    const message = buildSignInMessage(address, wallet.signInNonce);
    if (!this.isAllowedMockSignature(signature, address, wallet.signInNonce)) {
      let recovered: string;
      try {
        recovered = verifyMessage(message, signature).toLowerCase();
      } catch {
        throw new BadRequestException('Invalid signature format');
      }

      if (recovered !== address) {
        throw new UnauthorizedException('Signature does not match the wallet address');
      }
    }

    // One-time use: clear the nonce and stamp the connection time.
    wallet.signInNonce = null;
    wallet.lastConnectedAt = new Date();
    await this.wallets.save(wallet);
    await this.usersService.updateLastLogin(wallet.userId);

    if (!wallet.user) {
      wallet.user = await this.usersService.findById(wallet.userId);
    }
    return { wallet, user: wallet.user };
  }

  private isAllowedMockSignature(
    signature: string,
    address: string,
    nonce: string,
  ): boolean {
    if (!this.config.get<boolean>('walletAuth.allowMockSignature')) {
      return false;
    }

    try {
      const hex = signature.startsWith('0x') ? signature.slice(2) : signature;
      const payload = Buffer.from(hex, 'hex').toString('utf8');
      return payload === buildMockSignInSignaturePayload(address, nonce);
    } catch {
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // User-facing wallet management
  // -------------------------------------------------------------------------

  async listByUser(userId: string): Promise<Wallet[]> {
    return this.wallets.find({
      where: { userId },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  /** Binds an address to the user. The first wallet becomes the primary one. */
  async bindWallet(
    user: User,
    rawAddress: string,
    chainId?: number,
    label?: string,
  ): Promise<Wallet> {
    const address = this.normalizeAddress(rawAddress);

    const existing = await this.wallets.findOne({
      where: { address, chainType: ChainType.EVM },
    });
    if (existing) {
      if (existing.userId === user.id) {
        throw new ConflictException('This wallet is already bound to your account');
      }
      throw new ConflictException('This wallet is already bound to another account');
    }

    const walletCount = await this.wallets.count({ where: { userId: user.id } });
    const wallet = this.wallets.create({
      userId: user.id,
      address,
      chainType: ChainType.EVM,
      chainId: chainId ?? null,
      label: label ?? null,
      isPrimary: walletCount === 0,
      lastConnectedAt: new Date(),
    });
    return this.wallets.save(wallet);
  }

  /** Removes a wallet from its owner. Reassigns primary when needed. */
  async unbindForUser(user: User, walletId: string): Promise<void> {
    const wallet = await this.wallets.findOne({
      where: { id: walletId, userId: user.id },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    await this.unbind(wallet);
  }

  // -------------------------------------------------------------------------
  // Admin operations
  // -------------------------------------------------------------------------

  async findAll(
    query: AdminListWalletsQueryDto,
  ): Promise<PaginatedResultDto<Wallet>> {
    const qb = this.wallets
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.user', 'user')
      .orderBy('wallet.createdAt', 'DESC');

    if (query.address) {
      qb.andWhere('wallet.address ILIKE :address', {
        address: `%${query.address.trim().toLowerCase()}%`,
      });
    }
    if (query.userId) {
      qb.andWhere('wallet.user_id = :userId', { userId: query.userId });
    }
    if (query.chainType) {
      qb.andWhere('wallet.chain_type = :chainType', {
        chainType: query.chainType,
      });
    }

    qb.skip(query.skip).take(query.take);
    const [items, total] = await qb.getManyAndCount();
    return new PaginatedResultDto(items, total, query.page, query.pageSize);
  }

  async findOne(id: string): Promise<Wallet> {
    const wallet = await this.wallets.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  /** Admin-driven unbind. Deletes the wallet and reassigns primary if needed. */
  async unbind(wallet: Wallet): Promise<void> {
    const wasPrimary = wallet.isPrimary;
    await this.wallets.delete(wallet.id);

    if (wasPrimary) {
      const next = await this.wallets.findOne({
        where: { userId: wallet.userId },
        order: { createdAt: 'DESC' },
      });
      if (next) {
        next.isPrimary = true;
        await this.wallets.save(next);
      }
    }
  }
}
