import { KycDocumentType } from '@veya/shared';
import { apiRequest } from './client';
import type {
  FeatureModuleRecord,
  KycSubmissionRecord,
  UserProfile,
  WalletRecord,
} from './types';

export interface WalletNonceResponse {
  address: string;
  nonce: string;
  message: string;
}

export interface WalletVerifyResponse {
  accessToken: string;
  expiresIn: string;
  user: UserProfile;
}

export async function requestWalletNonce(address: string) {
  return apiRequest<WalletNonceResponse>('/v1/wallets/nonce', {
    auth: false,
    method: 'POST',
    body: JSON.stringify({ address }),
  });
}

export async function verifyWallet(address: string, signature: string) {
  return apiRequest<WalletVerifyResponse>('/v1/wallets/verify', {
    auth: false,
    method: 'POST',
    body: JSON.stringify({ address, signature }),
  });
}

export async function fetchProfile() {
  return apiRequest<UserProfile>('/v1/profile');
}

export async function fetchWallets() {
  return apiRequest<WalletRecord[]>('/v1/wallets');
}

export async function bindWallet(
  address: string,
  chainId?: number,
  label?: string,
) {
  return apiRequest<WalletRecord>('/v1/wallets', {
    method: 'POST',
    body: JSON.stringify({ address, chainId, label }),
  });
}

export async function unbindWallet(id: string) {
  return apiRequest<{ success: true }>(`/v1/wallets/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchEnabledModules() {
  return apiRequest<FeatureModuleRecord[]>('/v1/feature-modules', {
    auth: false,
  });
}

export async function fetchMyKycSubmissions() {
  return apiRequest<KycSubmissionRecord[]>('/v1/kyc/submissions/me');
}

export interface KycSubmissionInput {
  level: number;
  fullName: string;
  documentType: KycDocumentType;
  documentNumber: string;
  country: string;
  dateOfBirth: string;
  document?: {
    uri: string;
    name: string;
    mimeType: string;
  };
}

export async function submitKyc(input: KycSubmissionInput) {
  const formData = new FormData();
  formData.append('level', String(input.level));
  formData.append('fullName', input.fullName);
  formData.append('documentType', input.documentType);
  formData.append('documentNumber', input.documentNumber);
  formData.append('country', input.country.toUpperCase());
  formData.append('dateOfBirth', input.dateOfBirth);

  if (input.document) {
    formData.append('idFront', {
      uri: input.document.uri,
      name: input.document.name,
      type: input.document.mimeType,
    } as unknown as Blob);
  }

  return apiRequest<KycSubmissionRecord>('/v1/kyc/submissions', {
    method: 'POST',
    body: formData,
  });
}
