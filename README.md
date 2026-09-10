# Veya

> A TypeScript full-stack virtual DApp trading platform.

Veya is a development and learning project for building a Web3-style trading
product with a mobile app, an admin console, and a NestJS backend. The current
version focuses on local sandbox workflows: wallet authentication, demo market
data, user assets, transaction records, KYC flows, and admin operations.

## Preview

### Admin Console

![Veya admin dashboard](image/截屏2026-09-10%2016.06.58.png)

![Veya admin management view](image/截屏2026-09-10%2016.07.36.png)

### Mobile App

![Veya mobile markets screen](image/截屏2026-09-10%2016.12.19.png)

![Veya mobile assets screen](image/截屏2026-09-10%2016.12.29.png)

## Applications

- `app` - user-facing Expo React Native app
- `admin` - React + Vite admin console
- `backend` - NestJS API with TypeORM and PostgreSQL
- `packages/shared` - shared TypeScript package for cross-app contracts

## Stack

- TypeScript
- React, React Native, Expo
- Vite, Ant Design, Ant Design Pro Components
- NestJS, TypeORM
- PostgreSQL
- Docker Compose

## Local Docker Start

Build images and start the full local stack:

```bash
docker compose up --build -d
```

Local URLs:

- Backend API docs: http://127.0.0.1:3002/api/docs
- Admin console: http://127.0.0.1:5173
- App web preview: http://127.0.0.1:8081
- PostgreSQL: `127.0.0.1:55432`

Seeded admin account:

```txt
Username: superadmin
Password: Admin@123456
```

Stop the stack:

```bash
docker compose down
```

## Local Package Scripts

```bash
pnpm install
pnpm dev:backend
pnpm dev:admin
pnpm dev:app
```

Useful checks:

```bash
pnpm typecheck
pnpm build
```

## Current Sandbox Behavior

The app uses a development-only mock wallet signature flow so local testing can
exercise the backend nonce/JWT path without a mobile wallet SDK. Sandbox assets,
market prices, candles, and transactions are seeded demo data and do not
represent real funds or financial services.

## More Detail

The implementation roadmap and engineering notes live in
[DEVELOP_PLAN.md](./DEVELOP_PLAN.md).

## Disclaimer

Veya is an educational and development project. Any future integration with real
digital assets, fiat payments, custody, KYC/AML, or financial transactions would
require production-grade security, compliance, regulatory, and legal review.
