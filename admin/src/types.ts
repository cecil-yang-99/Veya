/**
 * Frontend view models mirroring the backend API contracts.
 * Keep field names identical to the backend JSON payloads.
 */

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminProfile {
  id: string;
  username: string;
  email: string | null;
  role: 'super_admin' | 'admin' | 'compliance';
  status: 'active' | 'disabled';
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  userCode: string;
  nickname: string | null;
  email: string | null;
  status: 'active' | 'suspended' | 'banned';
  kycLevel: number;
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
  lastLoginAt: string | null;
  createdAt: string;
}

export interface WalletRecord {
  id: string;
  userId: string;
  address: string;
  chainType: 'evm';
  chainId: number | null;
  label: string | null;
  isPrimary: boolean;
  lastConnectedAt: string | null;
  createdAt: string;
  user?: UserRecord;
}

export interface UserDetail extends UserRecord {
  wallets: WalletRecord[];
  latestKyc: KycSubmissionRecord | null;
}

export interface KycSubmissionRecord {
  id: string;
  userId: string;
  level: number;
  status: 'pending' | 'approved' | 'rejected';
  fullName: string;
  documentType: 'id_card' | 'passport' | 'driver_license';
  documentNumber: string;
  country: string;
  dateOfBirth: string;
  documentFiles: string[];
  reviewedById: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
  user?: UserRecord;
  reviewedBy?: AdminProfile | null;
}

export interface FeatureModuleRecord {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  isEnabled: boolean;
  sortOrder: number;
  isSystem: boolean;
}

export interface AdminUserRecord {
  id: string;
  username: string;
  email: string | null;
  role: 'super_admin' | 'admin' | 'compliance';
  status: 'active' | 'disabled';
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actorType: 'admin' | 'user' | 'system';
  adminUserId: string | null;
  actorName: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  method: string;
  path: string;
  statusCode: number | null;
  ip: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface DashboardSummary {
  users: { total: number; active: number; suspended: number; banned: number };
  pendingKyc: number;
  totalWallets: number;
  featureModules: { enabled: number; total: number };
}
