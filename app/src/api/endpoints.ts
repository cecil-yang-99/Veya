import { KycDocumentType } from '@veya/shared';
import { apiRequest } from './client';
import type {
  AssetBalanceRecord,
  AssetSummary,
  FeatureModuleRecord,
  KycSubmissionRecord,
  MarketCandleRecord,
  MarketPairRecord,
  Paginated,
  TokenRecord,
  UserProfile,
  UserTransactionRecord,
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

export async function fetchTokens() {
  return apiRequest<TokenRecord[]>('/v1/tokens', { auth: false });
}

export async function fetchToken(symbol: string) {
  return apiRequest<TokenRecord>(`/v1/tokens/${encodeURIComponent(symbol)}`, {
    auth: false,
  });
}

export async function fetchMarkets() {
  return apiRequest<MarketPairRecord[]>('/v1/markets', { auth: false });
}

export async function fetchMarket(symbol: string) {
  return apiRequest<MarketPairRecord>(`/v1/markets/${marketPathSymbol(symbol)}`, {
    auth: false,
  });
}

export async function fetchMarketCandles(symbol: string, limit = 24) {
  return apiRequest<MarketCandleRecord[]>(
    `/v1/markets/${marketPathSymbol(symbol)}/candles?interval=1h&limit=${limit}`,
    { auth: false },
  );
}

export async function fetchAssets() {
  return apiRequest<AssetBalanceRecord[]>('/v1/assets');
}

export async function fetchAssetSummary() {
  return apiRequest<AssetSummary>('/v1/assets/summary');
}

export async function fetchTransactions(page = 1, pageSize = 20) {
  return apiRequest<Paginated<UserTransactionRecord>>(
    `/v1/transactions?page=${page}&pageSize=${pageSize}`,
  );
}

export async function fetchTransaction(id: string) {
  return apiRequest<UserTransactionRecord>(`/v1/transactions/${id}`);
}

function marketPathSymbol(symbol: string): string {
  return encodeURIComponent(symbol.replace('/', '-'));
}
