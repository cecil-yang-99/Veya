import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Express } from 'express';
import { FeatureModuleCode } from '@veya/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequireFeature } from '../common/decorators/require-feature.decorator';
import { JwtUserGuard } from '../common/guards/jwt-user.guard';
import { FeatureEnabledGuard } from '../common/guards/feature-enabled.guard';
import { User } from '../users/entities/user.entity';
import { KycService } from './kyc.service';
import { CreateKycSubmissionDto } from './dto/kyc.dto';

/** Multer field configuration for the three supported document slots. */
const FILE_FIELDS = [
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
] as const;

type UploadedKycFiles = Partial<
  Record<(typeof FILE_FIELDS)[number]['name'], Express.Multer.File[]>
>;

/**
 * User-facing KYC endpoints. Submissions are multipart/form-data; files are
 * stored on local disk under `uploads/kyc/` (dev-grade storage).
 */
@Controller('v1/kyc')
@UseGuards(JwtUserGuard, FeatureEnabledGuard)
export class KycUserController {
  constructor(private readonly kycService: KycService) {}

  @Post('submissions')
  @RequireFeature(FeatureModuleCode.KYC)
  @UseInterceptors(
    FileFieldsInterceptor([...FILE_FIELDS], {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'kyc');
          mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${randomUUID()}-${file.fieldname}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = /^(image\/(png|jpe?g|webp)|application\/pdf)$/;
        if (!allowed.test(file.mimetype)) {
          cb(
            new BadRequestException(
              'Only PNG, JPEG, WebP images or PDF documents are allowed',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
    }),
  )
  submit(
    @CurrentUser() user: User,
    @Body() dto: CreateKycSubmissionDto,
    @UploadedFiles() files: UploadedKycFiles,
  ) {
    // Convert stored files into URL-relative paths served from /uploads.
    const documentFiles = FILE_FIELDS.flatMap(({ name }) =>
      (files[name] ?? []).map((file) => `/uploads/kyc/${file.filename}`),
    );
    return this.kycService.submit(user, dto, documentFiles);
  }

  @Get('submissions/me')
  listMine(@CurrentUser() user: User) {
    return this.kycService.listMine(user.id);
  }
}
