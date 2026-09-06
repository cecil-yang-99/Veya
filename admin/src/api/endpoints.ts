/**
 * Typed API endpoints used by the admin console.
 * Query parameters follow the backend pagination contract
 * (`page`, `pageSize`); ProTable's `current` is mapped to `page`.
 */
import { api } from './client';
import type {
  AdminProfile,
  AdminUserRecord,
  AuditLogRecord,
  DashboardSummary,
  FeatureModuleRecord,
  KycSubmissionRecord,
  Paginated,
  UserDetail,
  UserRecord,
  WalletRecord,
} from '../types';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function login(username: string, password: string) {
  const { data } = await api.post<{
    accessToken: string;
    admin: AdminProfile;
  }>('/admin/auth/login', { username, password });
  return data;
}

export async function fetchProfile(): Promise<AdminProfile> {
  const { data } = await api.get<AdminProfile>('/admin/auth/profile');
  return data;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>('/admin/dashboard/summary');
  return data;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface ListParams {
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

export async function listUsers(params: ListParams) {
  const { data } = await api.get<Paginated<UserRecord>>('/admin/users', {
    params,
  });
  return data;
}

export async function getUser(id: string): Promise<UserDetail> {
  const { data } = await api.get<UserDetail>(`/admin/users/${id}`);
  return data;
}

export async function setUserStatus(
  id: string,
  status: UserRecord['status'],
): Promise<UserRecord> {
  const { data } = await api.patch<UserRecord>(`/admin/users/${id}/status`, {
    status,
  });
  return data;
}

// ---------------------------------------------------------------------------
// Wallets
// ---------------------------------------------------------------------------

export async function listWallets(params: ListParams) {
  const { data } = await api.get<Paginated<WalletRecord>>('/admin/wallets', {
    params,
  });
  return data;
}

export async function unbindWallet(id: string): Promise<void> {
  await api.delete(`/admin/wallets/${id}`);
}

// ---------------------------------------------------------------------------
// KYC
// ---------------------------------------------------------------------------

export async function listKycSubmissions(params: ListParams) {
  const { data } = await api.get<Paginated<KycSubmissionRecord>>(
    '/admin/kyc/submissions',
    { params },
  );
  return data;
}

export async function getKycSubmission(
  id: string,
): Promise<KycSubmissionRecord> {
  const { data } = await api.get<KycSubmissionRecord>(
    `/admin/kyc/submissions/${id}`,
  );
  return data;
}

export async function approveKyc(id: string): Promise<KycSubmissionRecord> {
  const { data } = await api.post<KycSubmissionRecord>(
    `/admin/kyc/submissions/${id}/approve`,
  );
  return data;
}

export async function rejectKyc(
  id: string,
  reason: string,
): Promise<KycSubmissionRecord> {
  const { data } = await api.post<KycSubmissionRecord>(
    `/admin/kyc/submissions/${id}/reject`,
    { reason },
  );
  return data;
}

// ---------------------------------------------------------------------------
// Feature modules
// ---------------------------------------------------------------------------

export async function listFeatureModules(): Promise<FeatureModuleRecord[]> {
  const { data } = await api.get<FeatureModuleRecord[]>('/admin/feature-modules');
  return data;
}

export async function toggleFeatureModule(
  id: string,
  isEnabled: boolean,
): Promise<FeatureModuleRecord> {
  const { data } = await api.patch<FeatureModuleRecord>(
    `/admin/feature-modules/${id}/toggle`,
    { isEnabled },
  );
  return data;
}

// ---------------------------------------------------------------------------
// Administrator accounts
// ---------------------------------------------------------------------------

export async function listAdmins(params: ListParams) {
  const { data } = await api.get<Paginated<AdminUserRecord>>('/admin/admins', {
    params,
  });
  return data;
}

export interface CreateAdminPayload {
  username: string;
  email?: string;
  password: string;
  role: AdminUserRecord['role'];
}

export async function createAdmin(
  payload: CreateAdminPayload,
): Promise<AdminUserRecord> {
  const { data } = await api.post<AdminUserRecord>('/admin/admins', payload);
  return data;
}

export async function updateAdmin(
  id: string,
  payload: Partial<Pick<AdminUserRecord, 'email' | 'role'>>,
): Promise<AdminUserRecord> {
  const { data } = await api.patch<AdminUserRecord>(`/admin/admins/${id}`, payload);
  return data;
}

export async function setAdminStatus(
  id: string,
  status: AdminUserRecord['status'],
): Promise<AdminUserRecord> {
  const { data } = await api.patch<AdminUserRecord>(
    `/admin/admins/${id}/status`,
    { status },
  );
  return data;
}

export async function resetAdminPassword(
  id: string,
  newPassword: string,
): Promise<void> {
  await api.post(`/admin/admins/${id}/reset-password`, { newPassword });
}

// ---------------------------------------------------------------------------
// Audit logs
// ---------------------------------------------------------------------------

export async function listAuditLogs(params: ListParams) {
  const { data } = await api.get<Paginated<AuditLogRecord>>('/admin/audit-logs', {
    params,
  });
  return data;
}
