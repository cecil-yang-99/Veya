import type {
  ChainType,
  CandleInterval,
  FeatureModuleCode,
  KycDocumentType,
  KycStatus,
  MarketStatus,
  TokenStatus,
  TransactionStatus,
  TransactionType,
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

export interface TokenRecord {
  id: string;
  symbol: string;
  name: string;
  chain: string;
  contractAddress: string | null;
  decimals: number;
  logoUrl: string | null;
  status: TokenStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketPairRecord {
  id: string;
  symbol: string;
  baseTokenId: string;
  baseToken: TokenRecord;
  quoteTokenId: string;
  quoteToken: TokenRecord;
  lastPrice: string;
  change24h: string;
  volume24h: string;
  status: MarketStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketCandleRecord {
  id: string;
  pairId: string;
  interval: CandleInterval;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  openedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetBalanceRecord {
  id: string;
  userId: string;
  tokenId: string;
  token: TokenRecord;
  available: string;
  frozen: string;
  estimatedUsdValue: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetSummary {
  currency: 'USD';
  totalEstimatedUsdValue: string;
  sandbox: boolean;
  assetCount: number;
}

export interface UserTransactionRecord {
  id: string;
  userId: string;
  walletId: string | null;
  wallet?: WalletRecord | null;
  type: TransactionType;
  status: TransactionStatus;
  assetBalanceId: string | null;
  fromTokenId: string | null;
  fromToken?: TokenRecord | null;
  toTokenId: string | null;
  toToken?: TokenRecord | null;
  fromAmount: string | null;
  toAmount: string | null;
  usdValue: string;
  txHash: string | null;
  network: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
