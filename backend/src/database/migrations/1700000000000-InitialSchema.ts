import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Initial schema for the platform administration domain:
 * administrator accounts, end users, wallets, KYC submissions,
 * feature-module toggles, and the append-only audit log.
 */
export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // uuid_generate_v4() is used by TypeORM's uuid primary columns.
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // -----------------------------------------------------------------------
    // Enum types
    // -----------------------------------------------------------------------
    await queryRunner.query(
      `CREATE TYPE "admin_role_enum" AS ENUM ('super_admin', 'admin', 'compliance')`,
    );
    await queryRunner.query(
      `CREATE TYPE "admin_status_enum" AS ENUM ('active', 'disabled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_status_enum" AS ENUM ('active', 'suspended', 'banned')`,
    );
    await queryRunner.query(
      `CREATE TYPE "kyc_status_enum" AS ENUM ('none', 'pending', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TYPE "chain_type_enum" AS ENUM ('evm')`,
    );
    await queryRunner.query(
      `CREATE TYPE "kyc_submission_status_enum" AS ENUM ('pending', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TYPE "kyc_document_type_enum" AS ENUM ('id_card', 'passport', 'driver_license')`,
    );
    await queryRunner.query(
      `CREATE TYPE "audit_actor_type_enum" AS ENUM ('admin', 'user', 'system')`,
    );

    // -----------------------------------------------------------------------
    // admin_users
    // -----------------------------------------------------------------------
    await queryRunner.createTable(
      new Table({
        name: 'admin_users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'username', type: 'varchar', length: '64', isUnique: true },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
          { name: 'password_hash', type: 'varchar', length: '255' },
          { name: 'role', type: 'admin_role_enum', default: `'admin'` },
          { name: 'status', type: 'admin_status_enum', default: `'active'` },
          { name: 'last_login_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    // -----------------------------------------------------------------------
    // users
    // -----------------------------------------------------------------------
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_code', type: 'varchar', length: '32', isUnique: true },
          { name: 'nickname', type: 'varchar', length: '128', isNullable: true },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
          { name: 'status', type: 'user_status_enum', default: `'active'` },
          { name: 'kyc_level', type: 'int', default: '0' },
          { name: 'kyc_status', type: 'kyc_status_enum', default: `'none'` },
          { name: 'last_login_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    // -----------------------------------------------------------------------
    // wallets
    // -----------------------------------------------------------------------
    await queryRunner.createTable(
      new Table({
        name: 'wallets',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'address', type: 'varchar', length: '128' },
          { name: 'chain_type', type: 'chain_type_enum', default: `'evm'` },
          { name: 'chain_id', type: 'int', isNullable: true },
          { name: 'label', type: 'varchar', length: '128', isNullable: true },
          { name: 'is_primary', type: 'boolean', default: 'false' },
          { name: 'sign_in_nonce', type: 'varchar', length: '128', isNullable: true },
          { name: 'last_connected_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        uniques: [
          { name: 'uq_wallets_address_chain_type', columnNames: ['address', 'chain_type'] },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'wallets',
      new TableIndex({ name: 'idx_wallets_user_id', columnNames: ['user_id'] }),
    );

    // -----------------------------------------------------------------------
    // kyc_submissions
    // -----------------------------------------------------------------------
    await queryRunner.createTable(
      new Table({
        name: 'kyc_submissions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'level', type: 'int' },
          { name: 'status', type: 'kyc_submission_status_enum', default: `'pending'` },
          { name: 'full_name', type: 'varchar', length: '255' },
          { name: 'document_type', type: 'kyc_document_type_enum' },
          { name: 'document_number', type: 'varchar', length: '128' },
          { name: 'country', type: 'varchar', length: '64' },
          { name: 'date_of_birth', type: 'date' },
          { name: 'document_files', type: 'jsonb', default: `'[]'::jsonb` },
          { name: 'reviewed_by_id', type: 'uuid', isNullable: true },
          { name: 'reviewed_at', type: 'timestamptz', isNullable: true },
          { name: 'reject_reason', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['reviewed_by_id'],
            referencedTableName: 'admin_users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'kyc_submissions',
      new TableIndex({ name: 'idx_kyc_user_id', columnNames: ['user_id'] }),
    );
    await queryRunner.createIndex(
      'kyc_submissions',
      new TableIndex({ name: 'idx_kyc_status', columnNames: ['status'] }),
    );

    // -----------------------------------------------------------------------
    // feature_modules
    // -----------------------------------------------------------------------
    await queryRunner.createTable(
      new Table({
        name: 'feature_modules',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'code', type: 'varchar', length: '64', isUnique: true },
          { name: 'name', type: 'varchar', length: '128' },
          { name: 'description', type: 'varchar', length: '512', isNullable: true },
          { name: 'category', type: 'varchar', length: '64', isNullable: true },
          { name: 'icon', type: 'varchar', length: '64', isNullable: true },
          { name: 'is_enabled', type: 'boolean', default: 'true' },
          { name: 'sort_order', type: 'int', default: '0' },
          { name: 'is_system', type: 'boolean', default: 'true' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    // -----------------------------------------------------------------------
    // audit_logs (append-only)
    // -----------------------------------------------------------------------
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'actor_type', type: 'audit_actor_type_enum', default: `'admin'` },
          { name: 'admin_user_id', type: 'uuid', isNullable: true },
          { name: 'actor_name', type: 'varchar', length: '255', isNullable: true },
          { name: 'action', type: 'varchar', length: '128' },
          { name: 'resource', type: 'varchar', length: '128' },
          { name: 'resource_id', type: 'varchar', length: '128', isNullable: true },
          { name: 'method', type: 'varchar', length: '16' },
          { name: 'path', type: 'varchar', length: '512' },
          { name: 'status_code', type: 'int', isNullable: true },
          { name: 'ip', type: 'varchar', length: '64', isNullable: true },
          { name: 'user_agent', type: 'varchar', length: '512', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({ name: 'idx_audit_admin_user_id', columnNames: ['admin_user_id'] }),
    );
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({ name: 'idx_audit_action', columnNames: ['action'] }),
    );
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({ name: 'idx_audit_created_at', columnNames: ['created_at'] }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('feature_modules');
    await queryRunner.dropTable('kyc_submissions');
    await queryRunner.dropTable('wallets');
    await queryRunner.dropTable('users');
    await queryRunner.dropTable('admin_users');

    await queryRunner.query(`DROP TYPE IF EXISTS "audit_actor_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "kyc_document_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "kyc_submission_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "chain_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "kyc_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "admin_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "admin_role_enum"`);
  }
}
