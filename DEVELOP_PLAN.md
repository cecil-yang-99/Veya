# Veya Develop Plan

This document tracks the development direction for Veya. Keep `README.md` short
and visitor-friendly; use this file for roadmap, engineering notes, module
scope, and future implementation phases.

## Product Goal

Veya aims to simulate a complete Web3 trading product:

- user wallet login and profile flows
- sandbox token and market browsing
- portfolio and transaction history
- KYC submission and review
- admin management for users, wallets, KYC, modules, and audit logs
- backend APIs that can later evolve toward real chain integrations

## System Shape

```txt
Veya
├── app                 Expo React Native user app
├── admin               React + Vite admin console
├── backend             NestJS API service
├── packages/shared     shared TypeScript package
└── docker-compose.yml  local container stack
```

Runtime flow:

```txt
App / Admin
    |
    v
Backend API
    |
    v
PostgreSQL
```

Future production-oriented flow:

```txt
App / Admin
    |
    v
Backend API
    |
    +--> PostgreSQL
    +--> Redis
    +--> Queue / Outbox
    +--> Blockchain RPC / Indexer
```

## Current Status

Implemented or partially implemented:

- monorepo workspace
- Docker images for `backend`, `admin`, and `app`
- Docker Compose local stack
- NestJS backend bootstrapping
- TypeORM migrations and seed data
- admin username/password login
- user mock-wallet authentication
- feature modules
- users, wallets, assets, transactions
- token and market sandbox data
- KYC user submission and admin review APIs
- audit log foundation
- admin dashboard and management screens
- Expo web preview for the mobile app

## Development Phases

### Phase 1 - Foundation

- Monorepo setup
- Shared TypeScript package
- Backend module structure
- Admin shell
- App shell
- PostgreSQL local development
- Dockerized local startup
- Environment configuration

### Phase 2 - Authentication And Accounts

- Admin login
- JWT guards
- User wallet nonce generation
- Wallet signature verification
- Development mock signature support
- User profile APIs
- Wallet binding and wallet list flows

### Phase 3 - Sandbox Trading Data

- Seed token catalog
- Seed trading pairs
- Deterministic OHLCV candles
- Market detail APIs
- App market browsing screens
- Sandbox portfolio initialization
- Transaction ledger for demo activity

### Phase 4 - Admin Operations

- Dashboard metrics
- User management
- Wallet management
- KYC review
- Feature module toggles
- Admin user management
- Audit log review

### Phase 5 - Product Hardening

- More precise loading and empty states
- Better API error mapping
- Form validation polish
- Role-based permission boundaries
- Request logging and trace IDs
- Rate limiting for auth endpoints
- More complete Docker health checks
- CI typecheck and build pipeline

### Phase 6 - Blockchain Integration

- RPC provider configuration
- Network registry
- ERC-20 metadata ingestion
- Wallet balance reads
- Transaction hash indexing
- Confirmation tracking
- Chain event listener
- Outbox-backed async processing

### Phase 7 - Production Architecture

- Redis caching
- Message queue consumers
- WebSocket or realtime updates
- Structured observability
- Secret management
- Deployment manifests
- Backup and restore strategy
- Security review
- Compliance review for any real-asset workflow

## Backend Plan

Near-term backend priorities:

- keep controllers thin and domain logic in services
- add unit tests for auth, wallets, KYC, assets, and transactions
- add integration tests for migration plus seed startup
- add request IDs to logs and audit events
- add a health endpoint for Docker and deployment checks
- avoid storing private keys or custody-sensitive material

API areas:

- `/api/admin/*` for operator/admin features
- `/api/v1/*` for user-facing app features
- `/api/docs` for Swagger documentation

## Admin Plan

Near-term admin priorities:

- keep table filters and pagination consistent
- improve detail views for users, wallets, KYC, and transactions
- add clear disabled/loading states for operational actions
- keep `/api` and `/uploads` proxied through the Vite dev server locally
- expand audit log visibility for sensitive actions

## App Plan

Near-term app priorities:

- polish login and mock wallet flow
- improve asset, market, and transaction states
- make API base URL clear for local web, simulator, and physical devices
- prepare wallet SDK integration behind a clean auth boundary
- keep mobile web preview usable through Expo while native targets evolve

## Data Plan

Current data is sandbox-only:

- tokens: BTC, ETH, USDT, USDC, SOL
- pairs: BTC/USDT, ETH/USDT, SOL/USDT, ETH/USDC
- candles: deterministic 1h OHLCV samples
- balances: seeded demo portfolio data
- transactions: database-backed sandbox ledger

Future data work:

- separate demo data from real data sources
- add idempotent seed commands
- add migration smoke checks
- introduce an outbox before external blockchain side effects

## Docker Plan

Current local ports:

- backend container `3000`, host `3002`
- admin container `5173`, host `5173`
- app container `8081`, host `8081`
- postgres container `5432`, host `55432`

Recommended local commands:

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f backend
docker compose down
```

## Security Notes

- JWT secrets must be replaced outside local development.
- Mock wallet signatures must stay disabled in production.
- Private keys should not be stored by the backend unless a formal custody
  architecture is introduced.
- CORS should be restricted per environment.
- Admin actions should continue to be covered by audit logging.

## Testing Plan

Backend:

- service unit tests
- controller integration tests
- migration and seed smoke tests
- auth and guard regression tests

Admin:

- form and table component tests
- API integration tests
- key admin workflow E2E tests

App:

- auth flow tests
- API client tests
- screen state tests
- mobile web smoke tests

## Definition Of Done

For a new feature:

- backend API is typed, validated, and documented
- frontend handles loading, empty, success, and error states
- database changes are covered by migrations
- local Docker startup still works
- relevant typecheck/build/test commands pass
- README stays concise and this plan is updated when scope changes
