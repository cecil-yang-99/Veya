/**
 * Centralized, typed configuration factory.
 *
 * Values are read from environment variables (loaded by @nestjs/config from
 * `.env`) with development-friendly defaults so the application can boot in a
 * local development setup without extra wiring.
 */
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'veya',
    password: process.env.DB_PASSWORD ?? 'veya_dev_password',
    database: process.env.DB_NAME ?? 'veya',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'veya-dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  walletAuth: {
    allowMockSignature:
      process.env.WALLET_AUTH_ALLOW_MOCK_SIGNATURE === 'true' ||
      (process.env.NODE_ENV ?? 'development') !== 'production',
  },
  /** Comma-separated list of origins allowed to call the API locally. */
  corsOrigins: (
    process.env.CORS_ORIGINS ??
    'http://localhost:5173,http://localhost:8081,http://localhost:19006'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  seed: {
    username: process.env.SEED_ADMIN_USERNAME ?? 'superadmin',
    password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123456',
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@veya.local',
  },
});
