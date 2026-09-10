# Veya Admin Console

React + Vite + Ant Design ProComponents management console for the Veya
platform.

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- The Veya backend running on `http://localhost:3000`

## Setup

```bash
# Install dependencies (from the repository root)
pnpm install

# Run the development server
pnpm dev
```

The console is served at `http://localhost:5173`. API calls (`/api/**`) and
uploaded files (`/uploads/**`) are proxied to the backend by Vite.

## Pages

| Route | Page | Notes |
| --- | --- | --- |
| `/` | Dashboard | Platform counters (users, pending KYC, wallets, modules) |
| `/users` | User Management | User list, detail drawer, account status actions |
| `/wallets` | Wallets | Connected wallet list, detail, unbind |
| `/kyc` | KYC Review | Submission queue, document review, approve/reject |
| `/modules` | Feature Modules | Enable/disable platform feature modules |
| `/admins` | Administrators | Admin account CRUD (super admin only) |
| `/audit-logs` | Audit Log | Read-only audit trail — **always accessible** |

## Behavior notes

- The sidebar entries for User Management, Wallets, and KYC Review are hidden
  when the corresponding feature module is disabled in Feature Modules.
- The **Audit Log** entry is always rendered regardless of module toggles.
- The Administrators page is only visible to the `super_admin` role.
- The JWT is persisted in `localStorage`; a 401 response clears the session
  and redirects to the login page.
