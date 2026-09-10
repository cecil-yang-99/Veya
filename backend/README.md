# Veya Backend

NestJS + TypeORM + PostgreSQL API for the Veya platform. This package
implements the administration domain: administrator accounts, platform users,
connected wallets, KYC verification, feature-module toggles, and the
append-only audit log.

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- PostgreSQL 16 (or use the `docker-compose.yml` in the repository root)

## Setup

```bash
# 1. Start PostgreSQL (from the repository root)
docker compose up -d postgres

# 2. Install dependencies (from the repository root)
pnpm install

# 3. Configure environment
cp .env.example .env

# 4. Create the database schema
pnpm migration:run

# 5. Seed the super administrator and the default feature modules
pnpm seed
```

The seed creates a super administrator from `SEED_ADMIN_USERNAME` /
`SEED_ADMIN_PASSWORD` (defaults: `superadmin` / `Admin@123456`) and registers
the default platform feature modules.

## Running

```bash
# Development with hot reload
pnpm start:dev

# Production build
pnpm build
pnpm start:prod
```

- API base URL: `http://localhost:3000/api`
- Swagger documentation: `http://localhost:3000/api/docs`
- Uploaded KYC documents are served from `/uploads/**` (local disk storage).

## Modules

| Module | Responsibility |
| --- | --- |
| `auth` | Admin username/password login and user wallet-signature (nonce) login; JWT issuance |
| `admin-users` | Administrator account CRUD (super admin only), status, password reset |
| `users` | End-user listing/detail, account status, KYC state transitions |
| `wallets` | EVM wallet binding, sign-in nonce/verify, admin wallet list and unbind |
| `kyc` | KYC submission with document upload, compliance review (approve/reject) |
| `feature-modules` | Platform feature registry; enable/disable toggles driving menu and API gating |
| `audit-log` | Append-only audit trail written by a global interceptor; read-only console API |
| `dashboard` | Aggregated platform counters for the admin console |

## Authentication

- **Admin console** (`/api/admin/**`): JWT Bearer token from
  `POST /api/admin/auth/login`, role-based access via `@Roles(...)`.
- **User API** (`/api/v1/**`): JWT Bearer token obtained by requesting a
  sign-in nonce (`POST /api/v1/wallets/nonce`) and submitting the signature
  of the returned message (`POST /api/v1/wallets/verify`).

## Database migrations

```bash
pnpm migration:run     # Apply all pending migrations
pnpm migration:revert  # Revert the latest migration
```

Schema changes must always go through committed TypeORM migrations;
`synchronize` is disabled.

## Notes

- KYC document files are stored on local disk under `uploads/kyc/` for
  development. A production deployment should use object storage and
  field-level encryption for PII such as document numbers.
- Redis is reserved for later phases (caching, queues, rate limiting).
