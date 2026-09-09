import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { FeatureModuleCode } from '@veya/shared';
import {
  fetchAssetSummary,
  fetchEnabledModules,
  fetchMarkets,
  fetchTransactions,
} from '../api/endpoints';
import type {
  AssetSummary,
  FeatureModuleRecord,
  MarketPairRecord,
  UserTransactionRecord,
} from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ScreenError } from '../components/ScreenState';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';
import { formatPercent, formatUsd } from '../utils/format';

export function HomeScreen() {
  const { refreshProfile, user } = useAuth();
  const [modules, setModules] = useState<FeatureModuleRecord[]>([]);
  const [summary, setSummary] = useState<AssetSummary | null>(null);
  const [markets, setMarkets] = useState<MarketPairRecord[]>([]);
  const [transactions, setTransactions] = useState<UserTransactionRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const [enabled, nextSummary, nextMarkets, nextTransactions] = await Promise.all([
      fetchEnabledModules(),
      fetchAssetSummary().catch(() => null),
      fetchMarkets().catch(() => []),
      fetchTransactions(1, 3).then((page) => page.items).catch(() => []),
      refreshProfile(),
    ]);
    setModules(enabled);
    setSummary(nextSummary);
    setMarkets(nextMarkets);
    setTransactions(nextTransactions);
  }, [refreshProfile]);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Unable to load home');
    });
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }

  const moduleCodes = new Set(modules.map((module) => module.code));

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      style={styles.screen}
    >
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Your Veya account at a glance.</Text>
      {error ? <ScreenError message={error} /> : null}
      <View style={styles.card}>
        <Text style={styles.label}>Portfolio value</Text>
        <Text style={[styles.title, { marginBottom: 14 }]}>
          {formatUsd(summary?.totalEstimatedUsdValue ?? 0)}
        </Text>
        <Text style={styles.label}>User code</Text>
        <Text style={styles.value}>{user?.userCode ?? 'Unknown'}</Text>
        <Text style={[styles.label, { marginTop: 14 }]}>Account status</Text>
        <Text style={styles.value}>{user?.status ?? 'unknown'}</Text>
        <Text style={[styles.label, { marginTop: 14 }]}>KYC</Text>
        <Text style={styles.value}>
          {user?.kycStatus ?? 'none'} / level {user?.kycLevel ?? 0}
        </Text>
      </View>
      <Text style={styles.sectionTitle}>Top movers</Text>
      {markets.slice(0, 3).map((market) => {
        const positive = Number(market.change24h) >= 0;
        return (
          <View key={market.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.value}>{market.symbol}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.value}>{formatUsd(market.lastPrice)}</Text>
                <Text style={{ color: positive ? colors.success : colors.danger }}>
                  {formatPercent(market.change24h)}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
      <Text style={styles.sectionTitle}>Recent transactions</Text>
      {transactions.map((transaction) => (
        <View key={transaction.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.value}>{transaction.type}</Text>
            <Text style={{ color: colors.success }}>{transaction.status}</Text>
          </View>
          <Text style={styles.label}>{formatUsd(transaction.usdValue)}</Text>
        </View>
      ))}
      <Text style={styles.sectionTitle}>Enabled modules</Text>
      {Object.values(FeatureModuleCode).map((code) => {
        const enabled = moduleCodes.has(code);
        return (
          <View key={code} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.value}>{code}</Text>
              <Text style={{ color: enabled ? colors.success : colors.muted }}>
                {enabled ? 'Enabled' : 'Unavailable'}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
