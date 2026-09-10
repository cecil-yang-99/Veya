# Veya — Admin, User, Wallet, KYC, Feature-Module & Audit Log Implementation Plan

> Scope note: all code comments, JSDoc, and documentation produced in this change MUST be written in English.

## Repository Research

- The repository is greenfield: only `README.md` exists (commit `a9db943 feat: init`, branch `feat/module-build`). No `app/`, `admin/`, or `backend/` code yet.
- `README.md` defines the target architecture: pnpm-style monorepo with `app/` (React user DApp), `admin/` (React + Ant Design + ProComponents console), `backend/` (NestJS + TypeScript + PostgreSQL + Redis), JWT + wallet-signature auth, RBAC, and backend modules `auth / users / wallets / assets / transactions / trading / blockchain / tokens / networks / admin / common`.
- The README does **not** specify a KYC module or a feature-module management module; both are new and must be designed. KYC is only mentioned in the compliance disclaimer.

## Decisions (confirmed with user)

| Decision | Choice |
|---|---|
| Delivery scope | Backend (NestJS) + Admin frontend (React). User-facing `app/` is out of scope this round. |
| ORM | TypeORM (entities + migrations + repositories) |
| "Module management" | Platform feature-module registry with enable/disable toggles, driving admin menu visibility and (later) user-facing API gating |
| Monorepo | pnpm workspaces (`backend`, `admin`, `packages/shared`) |
| Audit log | Implemented as a real backend service + read-only Admin page; its sidebar entry MUST always remain visible |

## Target Structure

```text
Veya/
├── package.json                    # root: pnpm workspaces scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .gitignore
├── docker-compose.yml              # postgres (+ redis placeholder) for local dev
├── packages/
│   └── shared/                     # shared enums, constants, API contract types
└── backend/
    └── src/
        ├── main.ts                 # bootstrap: validation pipe, helmet, CORS, swagger, static files
        ├── app.module.ts
        ├── config/                 # env config (typed)
        ├── common/
        │   ├── decorators/         # @CurrentAdmin, @CurrentUser, @Roles, @Audit
        │   ├── guards/             # JwtAdminGuard, JwtUserGuard, RolesGuard, FeatureEnabledGuard
        │   ├── interceptors/       # AuditLogInterceptor, TransformInterceptor
        │   ├── filters/            # Global exception filter
        │   └── dto/                # PaginationQueryDto, PaginatedResponseDto
        ├── database/
        │   ├── data-source.ts      # TypeORM CLI datasource
        │   ├── entities/base.entity.ts
        │   ├── migrations/         # generated migrations
        │   └── seeds/              # seed: super admin + feature modules
        ├── auth/                   # admin login (username+password) + user wallet-signature auth
        ├── admin-users/            # administrator accounts (管理员)
        ├── users/                  # platform end users (用户)
        ├── wallets/                # user wallet addresses (钱包)
        ├── kyc/                    # KYC submissions, document upload, admin review
        ├── feature-modules/        # platform module registry & toggles (模块)
        └── audit-log/              # audit log service + query API (Audit Log entry retained)
admin/
└── src/
    ├── main.tsx, App.tsx
    ├── api/                        # axios client, endpoints
    ├── store/                      # zustand auth store
    ├── router/                     # routes + menu gating
    ├── layouts/BasicLayout.tsx     # ProLayout sidebar; Audit Log entry is always rendered
    └── pages/
        ├── login/
        ├── dashboard/
        ├── users/                  # list + detail drawer
        ├── wallets/                # list + detail
        ├── kyc/                    # review queue + review modal
        ├── modules/                # feature-module toggles
        ├── admins/                 # administrator CRUD
        └── audit-log/              # read-only audit table (entry retained)
```

## Data Model (TypeORM entities)

- **AdminUser**: `id (uuid)`, `username (unique)`, `email`, `passwordHash` (bcryptjs), `role` enum (`super_admin` | `admin` | `compliance`), `status` (`active` | `disabled`), `lastLoginAt`, timestamps.
- **User**: `id (uuid)`, `userCode (unique)`, `nickname`, `email?`, `status` (`active` | `suspended` | `banned`), `kycLevel` (0 | 1 | 2), `kycStatus` (`none` | `pending` | `approved` | `rejected`), `lastLoginAt`, timestamps.
- **Wallet**: `id (uuid)`, `userId (FK)`, `address` (lowercased; unique together with `chainType`), `chainType` (`evm`), `chainId?`, `label?`, `isPrimary`, `signInNonce?`, `lastConnectedAt`, timestamps.
- **KycSubmission**: `id (uuid)`, `userId (FK)`, `level` (1 | 2), `status` (`pending` | `approved` | `rejected`), `fullName`, `documentType` (`id_card` | `passport` | `driver_license`), `documentNumber`, `country`, `dateOfBirth`, `documentFiles` (jsonb array of stored file paths), `reviewedById (FK AdminUser, nullable)`, `reviewedAt?`, `rejectReason?`, timestamps.
- **FeatureModule**: `id (uuid)`, `code (unique)` (`users`, `wallets`, `kyc`, `trading`, `swap`, `assets`, `transactions`, `settings`), `name`, `description?`, `category?`, `icon?`, `isEnabled (bool)`, `sortOrder`, `isSystem (bool)` — system modules cannot be deleted, timestamps.
- **AuditLog**: `id (uuid)`, `actorType` (`admin` | `user` | `system`), `adminUserId?`, `actorName?`, `action` (e.g. `admin.login`, `kyc.approve`, `module.toggle`), `resource`, `resourceId?`, `method`, `path`, `statusCode`, `ip?`, `userAgent?`, `metadata?` (jsonb), `createdAt`.

## API Surface (all under `/api`; Swagger at `/api/docs`)

Admin endpoints (`/api/admin/*`, admin JWT + RBAC):
- `POST /admin/auth/login` → access token; audited.
- `GET /admin/auth/profile`
- `GET/POST/PATCH /admin/admins`, `PATCH /admin/admins/:id/status`, `POST /admin/admins/:id/reset-password` (super_admin only).
- `GET /admin/users` (paginated, filters: status, kycStatus, kycLevel, search), `GET /admin/users/:id` (with wallets + latest KYC), `PATCH /admin/users/:id/status`.
- `GET /admin/wallets` (paginated, filters: address search, userId, chainType), `GET /admin/wallets/:id`, `DELETE /admin/wallets/:id` (unbind).
- `GET /admin/kyc/submissions` (filter status/level), `GET /admin/kyc/submissions/:id`, `POST /admin/kyc/submissions/:id/approve`, `POST /admin/kyc/submissions/:id/reject` (compliance/admin; approval sets `User.kycLevel/kycStatus`; all audited).
- `GET /admin/feature-modules`, `PATCH /admin/feature-modules/:id/toggle` (audited).
- `GET /admin/audit-logs` (paginated, filters: actor, action, resource, date range; read-only).
- `GET /admin/dashboard/summary` (user counts, pending KYC count, enabled modules).

User-facing endpoints (`/api/v1/*`, user JWT from wallet signature — needed so KYC/wallet data can exist):
- `POST /v1/wallets/nonce` (address → nonce), `POST /v1/wallets/verify` (signature → JWT, creates user+wallet on first login; ethers v6 `verifyMessage`).
- `GET /v1/profile`, `GET /v1/wallets`, `POST /v1/wallets` (bind), `DELETE /v1/wallets/:id`.
- `POST /v1/kyc/submissions` (multipart/form-data, multer disk storage under `uploads/kyc/`), `GET /v1/kyc/submissions/me`.
- `GET /v1/feature-modules` (enabled modules for menu/feature gating).

## Implementation Steps (dependency order)

1. **Monorepo scaffold**: root `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, `docker-compose.yml` (postgres 16, volume, env), `packages/shared` (enums: roles, statuses, module codes; shared types).
2. **Backend scaffold**: NestJS app, typed config (`@nestjs/config`), TypeORM PostgreSQL connection, `main.ts` (global `ValidationPipe`, helmet, CORS, `/api` prefix, Swagger, static serving of `uploads/`), global exception filter, pagination DTOs.
3. **Database foundation**: base entity, TypeORM datasource for CLI, initial migration for all six entities, seed script (`super_admin` from env vars `SEED_ADMIN_USERNAME/PASSWORD`, default feature modules).
4. **Auth (admin + user)**: bcryptjs password hashing, JWT strategies/guards for admin and user, `@CurrentAdmin`/`@CurrentUser`/`@Roles` decorators, `RolesGuard`; admin login endpoint; wallet nonce/verify endpoints with ethers v6 signature verification; user provisioning on first wallet login.
5. **Admin-users module**: entity + CRUD service/controller, super_admin-only guard, reset-password, status enable/disable.
6. **Users module**: list/detail (relational wallets + KYC), status actions (suspend/activate/ban).
7. **Wallets module**: admin list/detail/unbind; user-facing bind/list/remove; EVM address validation/normalization; primary wallet handling.
8. **KYC module**: multipart upload endpoint (multer), submission lifecycle state machine, admin review (approve → updates user level/status; reject → required reason), authorization (compliance + admin).
9. **Feature-modules module**: seeded system modules, admin list/toggle, public enabled-list endpoint, `FeatureEnabledGuard` for future user-facing gating.
10. **Audit-log module**: `AuditLogInterceptor` on `/api/admin/**` mutating requests + explicit audit on login/review/toggle; read-only list API; documented so the entry is never removed.
11. **Admin frontend scaffold**: Vite + React + TS + Ant Design v5 + ProComponents + React Router v6 + axios + zustand; token storage, axios interceptors (401 redirect), login page, `BasicLayout` with ProLayout sidebar.
12. **Admin pages**: Dashboard (stat cards), Users (ProTable + detail drawer + status actions), Wallets (ProTable + drawer), KYC (review queue + approve/reject modal), Modules (list with Switch), Admins (CRUD, super_admin only), Audit Log (read-only ProTable; **menu entry always rendered regardless of module toggles**).
13. **Docs & polish**: English `backend/README.md` and `admin/README.md` (setup, env, seed, run), English comments throughout; env example files.
14. **Validation pass**: builds, typechecks, smoke test.

## Dependencies and Considerations

- Key backend deps: `@nestjs/*`, `typeorm`, `pg`, `bcryptjs` (pure-JS — avoids native build issues on Windows), `@nestjs/jwt`, `ethers@^6`, `multer`/`@types/multer`, `class-validator`/`class-transformer`, `@nestjs/swagger`, `uuid`.
- Key admin deps: `vite`, `react`, `antd@^5`, `@ant-design/pro-components`, `react-router-dom@^6`, `axios`, `zustand`, `dayjs`.
- Redis is deferred (README lists it, but none of these modules require it; throttling uses in-memory guard for now; docker-compose can include a redis service for later phases).
- No real blockchain integration this round: wallet auth uses signature verification only; balances/indexer are future phases per README roadmap.
- KYC documents are stored on local disk via multer (dev/demo grade); production object storage is a future concern.
- All comments/JSDoc/READMEs in English; UI text can stay English as well (Admin console).

## Validation

- `pnpm install` at repo root succeeds.
- `pnpm --filter backend build` and `pnpm --filter admin build` pass with no TypeScript errors.
- `docker compose up -d postgres` → run migrations + seed → backend starts; Swagger reachable at `/api/docs`.
- Smoke flow (scripted or curl): admin login → list users → toggle a feature module → verify it appears disabled in `GET /api/v1/feature-modules` → wallet nonce/verify returns JWT → submit KYC as user → approve as compliance admin → user's `kycLevel` updated → each mutation appears in `GET /api/admin/audit-logs`.
- Admin frontend: login renders; sidebar shows all sections including **Audit Log** at all times; toggling a module hides/disables the corresponding menu entry but never Audit Log.
- A minimal backend e2e test (admin login + KYC approve flow) runs against the dockerized Postgres.

## Risks

- **Large scope for one pass**: mitigate by strictly excluding the user-facing `app/`, trading/blockchain/token modules, Redis usage, and real file-cloud upload; all are noted as follow-ups.
- **No local PostgreSQL during build**: mitigate with `docker-compose.yml`; TypeORM migrations are committed so schema is reproducible; build/typecheck do not require a live DB.
- **Windows native dependency issues**: use `bcryptjs` instead of `bcrypt`; ethers v6 is pure JS.
- **Audit-log entry accidentally hidden by module gating**: Audit Log is hardcoded in the layout (not driven by feature-module toggles) and the backend audit API requires no module flag.
- **KYC PII sensitivity**: document numbers stored as plain text for this dev phase; field-level encryption flagged as a future production requirement in code comments.
