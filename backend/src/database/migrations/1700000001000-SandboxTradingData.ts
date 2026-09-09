import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

/** Adds sandbox market, token, asset, and transaction tables. */
export class SandboxTradingData1700000001000 implements MigrationInterface {
  name = 'SandboxTradingData1700000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "token_status_enum" AS ENUM ('active', 'disabled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "market_status_enum" AS ENUM ('active', 'disabled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "candle_interval_enum" AS ENUM ('1h')`,
    );
    await queryRunner.query(
      `CREATE TYPE "transaction_type_enum" AS ENUM ('sandbox_funding', 'airdrop', 'deposit', 'withdrawal', 'transfer', 'trade', 'swap')`,
    );
    await queryRunner.query(
      `CREATE TYPE "transaction_status_enum" AS ENUM ('pending', 'success', 'failed')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'tokens',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'symbol', type: 'varchar', length: '16', isUnique: true },
          { name: 'name', type: 'varchar', length: '128' },
          { name: 'chain', type: 'varchar', length: '64' },
          { name: 'contract_address', type: 'varchar', length: '128', isNullable: true },
          { name: 'decimals', type: 'int' },
          { name: 'logo_url', type: 'varchar', length: '512', isNullable: true },
          { name: 'status', type: 'token_status_enum', default: `'active'` },
          { name: 'sort_order', type: 'int', default: '0' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'market_pairs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'symbol', type: 'varchar', length: '32', isUnique: true },
          { name: 'base_token_id', type: 'uuid' },
          { name: 'quote_token_id', type: 'uuid' },
          { name: 'last_price', type: 'numeric', precision: 28, scale: 8 },
          { name: 'change_24h', type: 'numeric', precision: 12, scale: 4 },
          { name: 'volume_24h', type: 'numeric', precision: 28, scale: 8 },
          { name: 'status', type: 'market_status_enum', default: `'active'` },
          { name: 'sort_order', type: 'int', default: '0' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['base_token_id'],
            referencedTableName: 'tokens',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
          {
            columnNames: ['quote_token_id'],
            referencedTableName: 'tokens',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'market_pairs',
      new TableIndex({ name: 'idx_market_pairs_status', columnNames: ['status'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'market_candles',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'pair_id', type: 'uuid' },
          { name: 'interval', type: 'candle_interval_enum', default: `'1h'` },
          { name: 'open', type: 'numeric', precision: 28, scale: 8 },
          { name: 'high', type: 'numeric', precision: 28, scale: 8 },
          { name: 'low', type: 'numeric', precision: 28, scale: 8 },
          { name: 'close', type: 'numeric', precision: 28, scale: 8 },
          { name: 'volume', type: 'numeric', precision: 28, scale: 8 },
          { name: 'opened_at', type: 'timestamptz' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['pair_id'],
            referencedTableName: 'market_pairs',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        uniques: [
          {
            name: 'uq_market_candles_pair_interval_opened_at',
            columnNames: ['pair_id', 'interval', 'opened_at'],
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'market_candles',
      new TableIndex({ name: 'idx_market_candles_pair_id', columnNames: ['pair_id'] }),
    );
    await queryRunner.createIndex(
      'market_candles',
      new TableIndex({ name: 'idx_market_candles_opened_at', columnNames: ['opened_at'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'asset_balances',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'token_id', type: 'uuid' },
          { name: 'available', type: 'numeric', precision: 28, scale: 8, default: '0' },
          { name: 'frozen', type: 'numeric', precision: 28, scale: 8, default: '0' },
          { name: 'estimated_usd_value', type: 'numeric', precision: 28, scale: 8, default: '0' },
          { name: 'source', type: 'varchar', length: '32', default: `'sandbox'` },
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
            columnNames: ['token_id'],
            referencedTableName: 'tokens',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
        ],
        uniques: [
          {
            name: 'uq_asset_balances_user_token',
            columnNames: ['user_id', 'token_id'],
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'asset_balances',
      new TableIndex({ name: 'idx_asset_balances_user_id', columnNames: ['user_id'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_transactions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'wallet_id', type: 'uuid', isNullable: true },
          { name: 'type', type: 'transaction_type_enum' },
          { name: 'status', type: 'transaction_status_enum', default: `'success'` },
          { name: 'asset_balance_id', type: 'uuid', isNullable: true },
          { name: 'from_token_id', type: 'uuid', isNullable: true },
          { name: 'to_token_id', type: 'uuid', isNullable: true },
          { name: 'from_amount', type: 'numeric', precision: 28, scale: 8, isNullable: true },
          { name: 'to_amount', type: 'numeric', precision: 28, scale: 8, isNullable: true },
          { name: 'usd_value', type: 'numeric', precision: 28, scale: 8, default: '0' },
          { name: 'tx_hash', type: 'varchar', length: '128', isNullable: true },
          { name: 'network', type: 'varchar', length: '64', isNullable: true },
          { name: 'metadata', type: 'jsonb', default: `'{}'::jsonb` },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['wallet_id'],
            referencedTableName: 'wallets',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
          new TableForeignKey({
            columnNames: ['asset_balance_id'],
            referencedTableName: 'asset_balances',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
          new TableForeignKey({
            columnNames: ['from_token_id'],
            referencedTableName: 'tokens',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
          new TableForeignKey({
            columnNames: ['to_token_id'],
            referencedTableName: 'tokens',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'user_transactions',
      new TableIndex({ name: 'idx_user_transactions_user_id', columnNames: ['user_id'] }),
    );
    await queryRunner.createIndex(
      'user_transactions',
      new TableIndex({ name: 'idx_user_transactions_status', columnNames: ['status'] }),
    );
    await queryRunner.createIndex(
      'user_transactions',
      new TableIndex({ name: 'idx_user_transactions_created_at', columnNames: ['created_at'] }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_transactions');
    await queryRunner.dropTable('asset_balances');
    await queryRunner.dropTable('market_candles');
    await queryRunner.dropTable('market_pairs');
    await queryRunner.dropTable('tokens');

    await queryRunner.query(`DROP TYPE IF EXISTS "transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "candle_interval_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "market_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "token_status_enum"`);
  }
}
