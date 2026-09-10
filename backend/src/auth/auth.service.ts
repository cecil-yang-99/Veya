import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import {
  AUDIT_ACTIONS,
  AdminStatus,
  AuditActorType,
} from '@veya/shared';
import { AdminUser } from '../admin-users/entities/admin-user.entity';
import { WalletsService } from '../wallets/wallets.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AdminLoginDto } from './dto/admin-login.dto';

/** Caller network context attached to audit records. */
export interface RequestContext {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly admins: Repository<AdminUser>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly walletsService: WalletsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  // -------------------------------------------------------------------------
  // Administrator authentication
  // -------------------------------------------------------------------------

  /**
   * Validates administrator credentials and issues a console JWT.
   * Failures intentionally return the same generic message to avoid
   * revealing whether the username exists.
   */
  async adminLogin(dto: AdminLoginDto, ctx: RequestContext) {
    const admin = await this.admins.findOne({
      where: { username: dto.username },
    });

    const passwordValid = admin
      ? await bcrypt.compare(dto.password, admin.passwordHash)
      : false;

    if (!admin || !passwordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }
    if (admin.status !== AdminStatus.ACTIVE) {
      throw new UnauthorizedException(
        'This administrator account is disabled',
      );
    }

    admin.lastLoginAt = new Date();
    await this.admins.save(admin);

    const accessToken = await this.jwtService.signAsync({
      sub: admin.id,
      type: 'admin',
    });

    await this.auditLogService.record({
      actorType: AuditActorType.ADMIN,
      adminUserId: admin.id,
      actorName: admin.username,
      action: AUDIT_ACTIONS.ADMIN_LOGIN,
      resource: 'admin_auth',
      method: 'POST',
      path: '/api/admin/auth/login',
      statusCode: 201,
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
      metadata: { username: admin.username },
    });

    return {
      accessToken,
      expiresIn: this.config.get<string>('jwt.expiresIn'),
      admin: this.toSafeAdmin(admin),
    };
  }

  /** Returns the administrator profile without credential material. */
  async getAdminProfile(adminId: string) {
    const admin = await this.admins.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new UnauthorizedException('Administrator not found');
    }
    return this.toSafeAdmin(admin);
  }

  // -------------------------------------------------------------------------
  // User wallet-signature authentication
  // -------------------------------------------------------------------------

  /** Issues a sign-in nonce for a wallet address. */
  walletNonce(address: string) {
    return this.walletsService.issueNonce(address);
  }

  /** Verifies the signed nonce and issues a user JWT. */
  async walletVerify(address: string, signature: string) {
    const { wallet, user } = await this.walletsService.verifySignature(
      address,
      signature,
    );
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      type: 'user',
      walletId: wallet.id,
    });
    return {
      accessToken,
      expiresIn: this.config.get<string>('jwt.expiresIn'),
      user,
    };
  }

  // -------------------------------------------------------------------------

  /** Strips internal fields (password hash) from an administrator record. */
  private toSafeAdmin(admin: AdminUser) {
    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
    };
  }
}
