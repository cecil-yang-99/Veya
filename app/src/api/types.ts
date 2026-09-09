import type {
  ChainType,
  FeatureModuleCode,
  KycDocumentType,
  KycStatus,
  UserStatus,
} from '@veya/shared';

export interface UserProfile {
  id: string;
  userCode: string;
  nickname: string | null;
  email: string | null;
  status: UserStatus;
  kycLevel: number;
  kycStatus: KycStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WalletRecord {
  id: string;
  userId: string;
  address: string;
  chainType: ChainType;
  chainId: number | null;
  label: string | null;
  isPrimary: boolean;
  lastConnectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureModuleRecord {
  id: string;
  code: FeatureModuleCode;
  name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  isEnabled: boolean;
  sortOrder: number;
}

export interface KycSubmissionRecord {
  id: string;
  userId: string;
  level: number;
  status: KycStatus;
  fullName: string;
  documentType: KycDocumentType;
  documentNumber: string;
  country: string;
  dateOfBirth: string;
  documentFiles: string[];
  reviewedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
}
