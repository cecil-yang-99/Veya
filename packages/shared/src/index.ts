/**
 * Shared domain enums and constants used by both the NestJS backend
 * and the React admin console.
 *
 * Keep this package free of any runtime dependency so it can be consumed
 * by both Node.js and browser bundles.
 */

// ---------------------------------------------------------------------------
// Administrator accounts
// ---------------------------------------------------------------------------

/** Roles for console administrators. Role strength increases top-to-bottom. */
export enum AdminRole {
  /** Full control, including administrator account management. */
  SUPER_ADMIN = 'super_admin',
  /** Day-to-day platform operator. */
  ADMIN = 'admin',
  /** Compliance reviewer, focused on KYC operations. */
  COMPLIANCE = 'compliance',
}

export enum AdminStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

// ---------------------------------------------------------------------------
// Platform end users
// ---------------------------------------------------------------------------

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

/** KYC verification level. 0 = unverified, 2 = highest tier. */
export enum KycLevel {
  NONE = 0,
  BASIC = 1,
  FULL = 2,
}

export enum KycStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum KycDocumentType {
  ID_CARD = 'id_card',
  PASSPORT = 'passport',
  DRIVER_LICENSE = 'driver_license',
}

// ---------------------------------------------------------------------------
// Wallets
// ---------------------------------------------------------------------------

/** Blockchain family of a connected wallet. Only EVM is supported for now. */
export enum ChainType {
  EVM = 'evm',
}

// ---------------------------------------------------------------------------
// Platform feature modules (toggled from the admin console)
// ---------------------------------------------------------------------------

/** Stable identifiers of the platform feature modules. */
export enum FeatureModuleCode {
  USERS = 'users',
  WALLETS = 'wallets',
  KYC = 'kyc',
  TRADING = 'trading',
  SWAP = 'swap',
  ASSETS = 'assets',
  TRANSACTIONS = 'transactions',
  SETTINGS = 'settings',
}

// ---------------------------------------------------------------------------
// Sandbox trading data
// ---------------------------------------------------------------------------

export enum TokenStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export enum MarketStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export enum CandleInterval {
  ONE_HOUR = '1h',
}

export enum TransactionType {
  SANDBOX_FUNDING = 'sandbox_funding',
  AIRDROP = 'airdrop',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  TRADE = 'trade',
  SWAP = 'swap',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export enum AuditActorType {
  ADMIN = 'admin',
  USER = 'user',
  SYSTEM = 'system',
}

/** Well-known audit action names. Free-form strings are also allowed. */
export const AUDIT_ACTIONS = {
  ADMIN_LOGIN: 'admin.login',
  ADMIN_CREATE: 'admin.create',
  ADMIN_UPDATE: 'admin.update',
  ADMIN_STATUS_CHANGE: 'admin.status_change',
  ADMIN_PASSWORD_RESET: 'admin.password_reset',
  USER_STATUS_CHANGE: 'user.status_change',
  WALLET_UNBIND: 'wallet.unbind',
  KYC_SUBMIT: 'kyc.submit',
  KYC_APPROVE: 'kyc.approve',
  KYC_REJECT: 'kyc.reject',
  MODULE_TOGGLE: 'module.toggle',
} as const;

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
