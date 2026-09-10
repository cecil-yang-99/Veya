import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

// Loaded for the TypeORM CLI (migrations, seed script). The Nest application
// itself uses ConfigModule/database.module.ts instead.
dotenv.config();

/**
 * Standalone TypeORM DataSource used by the CLI tooling
 * (`migration:run`, `migration:revert`) and the seed script.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'veya',
  password: process.env.DB_PASSWORD ?? 'veya_dev_password',
  database: process.env.DB_NAME ?? 'veya',
  // Works both under ts-node (src/**) and after compilation (dist/**).
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false,
  logging: false,
});
