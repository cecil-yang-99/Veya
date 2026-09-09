# Veya

> A modern virtual DApp trading platform built with TypeScript.

**Veya** is a full-stack virtual DApp trading platform designed to simulate and explore the architecture of modern Web3 trading applications.

The project includes three major applications:

- **App** — User-facing DApp trading application (Expo React Native)
- **Admin** — Platform management and administration console
- **Backend** — API services, business logic, data management, and blockchain integration

The entire platform is built with **TypeScript**, with **React** for frontend applications and **NestJS** for backend services.

***

## Project Architecture

```
Veya
├── app          # User-facing DApp
├── admin        # Admin management platform
└── backend      # Backend API and business services

```

High-level architecture:

```
                    ┌─────────────────────┐
                    │        Veya         │
                    │    DApp Trading     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Backend       │
                    │    NestJS + TS      │
                    └──────────┬──────────┘
                               │
               ┌───────────────┼────────────────┐
               │               │                │
               ▼               ▼                ▼
          PostgreSQL         Redis          Blockchain
                                            Networks
               ▲
               │
        ┌──────┴───────┐
        │     Admin    │
        │  React + TS  │
        └──────────────┘

```

***

# Technology Stack

## Frontend

- React
- React Native / Expo
- TypeScript
- Vite
- React Router
- Ant Design
- Web3 / Ethers.js
- Wallet integration

## Backend

- NestJS
- TypeScript
- PostgreSQL
- Redis
- REST API
- WebSocket
- JWT Authentication

## Blockchain

- Ethereum
- EVM-compatible networks
- Smart Contracts
- Wallets
- Tokens
- Blockchain Transactions
- On-chain / Off-chain data synchronization

## Admin

- React
- TypeScript
- Ant Design
- ProComponents
- Data Tables
- User Management
- Transaction Management
- Token Management
- Risk Management
- System Configuration

***

# Project Goals

Veya is designed to go beyond a simple token swap interface.

The project aims to simulate the architecture and business workflows of a complete Web3 trading platform.

Key areas include:

- DApp architecture
- Wallet integration
- Blockchain transactions
- Token transfers
- Token swaps
- Trading workflows
- User accounts
- Asset management
- Transaction history
- Backend API architecture
- Admin management
- Authentication
- Risk control
- Blockchain event processing
- On-chain / Off-chain data synchronization

***

# Core Features

## Wallet

Users can connect their Web3 wallets to Veya.

Supported functionality includes:

- Connect Wallet
- Wallet Address
- Network Detection
- Native Token Balance
- ERC-20 Token Balance
- Token Transfer
- Transaction History
- Wallet Authentication

The mobile MVP uses a development-only mock wallet signature flow so local
testing can exercise the nonce/JWT backend path without a mobile wallet SDK.
Production wallet authentication still verifies real EVM signatures.

***

## Running the Mobile App

The user-facing app lives in `app` and is built with Expo React Native.

```bash
# Install all workspace dependencies
pnpm install

# Start the backend API
pnpm dev:backend

# Start the mobile app
pnpm dev:app
```

Mobile app environment:

```bash
# Defaults to http://localhost:3000/api when omitted.
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

For physical devices, set `EXPO_PUBLIC_API_BASE_URL` to a backend URL reachable
from the device, such as your LAN IP address.

Backend development wallet-signature control:

```bash
# Enabled automatically outside production; set explicitly as needed.
WALLET_AUTH_ALLOW_MOCK_SIGNATURE=true
```

Local browser/mobile-web development origins are allowed by default:

```bash
CORS_ORIGINS=http://localhost:5173,http://localhost:8081,http://localhost:19006
```

***

# Trading

Veya provides a virtual DApp trading experience.

Example trading pairs:

```
ETH  → USDT
USDT → ETH
ETH  → USDC
USDC → ETH

```

Typical trading flow:

```
User
 │
 ▼
Connect Wallet
 │
 ▼
Select Token
 │
 ▼
Enter Amount
 │
 ▼
Request Quote
 │
 ▼
Confirm Trade
 │
 ▼
Create Transaction
 │
 ▼
Blockchain
 │
 ▼
Transaction Confirmation
 │
 ▼
Update Assets

```

***

# Asset Management

Veya maintains user asset information and balances.

Example:

```
User
│
├── ETH
│   └── Balance
│
├── USDT
│   └── Balance
│
├── USDC
│   └── Balance
│
└── Other Tokens
    └── Balance

```

The system distinguishes between different data sources:

```
On-chain Balance
       │
       ▼
Blockchain Indexer
       │
       ▼
Backend
       │
       ▼
Application Data

```

The current mobile MVP uses **sandbox balances**. On first asset access, the
backend initializes a deterministic demo portfolio and records sandbox funding
transactions. These balances are not custody data and do not represent real
digital assets.

***

# Transactions

Veya records user trading and blockchain transaction information.

Example transaction model:

```
Transaction
├── id
├── userId
├── walletAddress
├── type
├── fromToken
├── toToken
├── fromAmount
├── toAmount
├── status
├── txHash
├── network
├── gasFee
├── createdAt
└── updatedAt

```

Transaction lifecycle:

```
PENDING
   │
   ├── SUCCESS
   │
   └── FAILED

```

The current transaction ledger is synchronous and database-backed. RabbitMQ is
not required for this sandbox phase because there is no real chain indexing,
order matching, delayed settlement, or notification fanout. A future production
phase should revisit an outbox plus RabbitMQ consumers when external blockchain
events, withdrawals, market ingestion, or asynchronous confirmations are added.

***

# Market Data

The current market and token catalog is seeded sandbox data:

- Tokens: BTC, ETH, USDT, USDC, SOL
- Pairs: BTC/USDT, ETH/USDT, SOL/USDT, ETH/USDC
- Candles: deterministic 1h OHLCV samples

No external market API is called in this phase.

***

# User Management

The user system manages:

- User accounts
- Wallets
- Wallet addresses
- Authentication
- Assets
- Transactions
- Trading history
- Account status

Users can authenticate and interact with Veya through their Web3 wallets.

***

# Admin Platform

The Admin application provides management tools for the entire Veya platform.

## Dashboard

- Total Users
- Active Users
- Trading Volume
- Transaction Count
- Trading Statistics
- System Status

## User Management

- User List
- User Details
- Wallet Information
- Asset Information
- Trading History
- Transaction History
- Account Status

## Transaction Management

- Transaction List
- Transaction Details
- Transaction Status
- Transaction Hash
- Network
- Failed Transactions

## Token Management

- Token List
- Token Symbol
- Contract Address
- Decimals
- Network
- Token Status

## Network Management

- Supported Networks
- RPC Configuration
- Chain ID
- Network Status

## System Configuration

- Trading Configuration
- Fee Configuration
- Token Configuration
- Feature Flags
- Platform Settings

***

# Backend Architecture

The backend is built with **NestJS + TypeScript**.

The application follows a modular architecture:

```
backend
├── auth
├── users
├── wallets
├── assets
├── tokens
├── transactions
├── trading
├── blockchain
├── networks
├── admin
└── common

```

Each business domain is isolated into its own module to improve maintainability and scalability.

***

# Application Modules

## App

```
app
├── wallet
├── home
├── trade
├── swap
├── assets
├── transactions
├── profile
└── settings

```

## Admin

```
admin
├── dashboard
├── users
├── wallets
├── assets
├── transactions
├── trading
├── tokens
├── networks
├── settings
└── system

```

## Backend

```
backend
├── auth
├── users
├── wallets
├── assets
├── transactions
├── trading
├── blockchain
├── tokens
├── networks
└── admin

```

***

# Security

Veya will simulate common security mechanisms used by modern Web3 applications.

Security considerations include:

- JWT Authentication
- Wallet Signature Authentication
- Role-Based Access Control
- API Authentication
- Request Validation
- Rate Limiting
- Transaction Validation
- Permission Management
- Secure API Design

Private keys should never be stored or managed by the backend unless a dedicated custody architecture is explicitly introduced.

***

# Testing

Testing will be introduced throughout the project lifecycle.

## Backend

- Unit Tests
- Integration Tests
- API Tests
- E2E Tests

Important areas:

```
Controller
Service
Repository
Trading Logic
Transaction Logic
Blockchain Logic

```

## Frontend

- Component Tests
- Hook Tests
- API Tests
- User Flow Tests
- E2E Tests

***

# Development Roadmap

## Phase 1 — Foundation

- Monorepo Setup
- Backend Setup
- Admin Setup
- App Setup
- Database Setup
- Authentication
- User System

## Phase 2 — Wallet

- Wallet Connection
- Wallet Authentication
- Wallet Address
- Token Balances
- Network Detection

## Phase 3 — Trading

- Token List
- Trading Pairs
- Price Quotes
- Swap
- Transaction Creation
- Transaction History

## Phase 4 — Admin

- Dashboard
- User Management
- Transaction Management
- Token Management
- Network Management
- System Configuration

## Phase 5 — Blockchain

- RPC Integration
- Smart Contract Integration
- Blockchain Event Listener
- Transaction Indexer
- On-chain Data Synchronization
- Transaction Confirmation

## Phase 6 — Production Architecture

- Redis
- Message Queue
- WebSocket
- Rate Limiting
- Monitoring
- Structured Logging
- Error Tracking
- CI/CD

***

# Development Principles

## TypeScript First

The entire project is written primarily in TypeScript.

```
React
  │
  ▼
TypeScript
  │
  ▼
NestJS
  │
  ▼
TypeScript

```

## API First

Frontend applications communicate with the backend through clearly defined API contracts.

```
App / Admin
     │
     ▼
   REST API
     │
     ▼
   Backend
     │
     ├── Database
     │
     └── Blockchain

```

## Modular Architecture

Business domains should remain isolated and independently maintainable.

## Separation of Concerns

The system separates:

```
Controller
    ↓
Service
    ↓
Repository
    ↓
Domain Logic
    ↓
Infrastructure

```

Blockchain-related operations are separated from traditional application business logic wherever possible.

***

# Learning Objectives

Veya is also a practical project for learning modern full-stack and Web3 development.

The project aims to build a complete understanding of:

```
React
  ↓
API
  ↓
NestJS
  ↓
Database
  ↓
Blockchain
  ↓
Smart Contract

```

As well as the lifecycle of a Web3 trading application:

```
User
 ↓
Wallet
 ↓
Trade
 ↓
Transaction
 ↓
Blockchain
 ↓
Indexer
 ↓
Backend
 ↓
Admin

```

The ultimate goal is to build a complete **Full-Stack Web3 DApp Trading Platform** using modern TypeScript technologies.

***

# Project Status

Veya is currently under active development.

The project is being built incrementally, starting from the core application architecture and gradually introducing trading, blockchain, administration, and infrastructure capabilities.

***

# Disclaimer

Veya is a development and educational project.

Trading functionality, asset balances, prices, and other financial data may use simulated data and should not be considered real financial services.

Any future integration with real digital assets, fiat payments, custody services, or financial transactions would require appropriate security, compliance, KYC/AML, regulatory, and legal considerations.

***

# License

This project is intended for educational, research, and development purposes.
