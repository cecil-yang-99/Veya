import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { fetchAssets, fetchAssetSummary } from '../api/endpoints';
import type { AssetBalanceRecord, AssetSummary } from '../api/types';
import { ScreenError } from '../components/ScreenState';
import { styles } from '../theme/styles';
import { formatToken, formatUsd } from '../utils/format';

export function AssetsScreen() {
  const [summary, setSummary] = useState<AssetSummary | null>(null);
  const [assets, setAssets] = useState<AssetBalanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const [nextSummary, nextAssets] = await Promise.all([
      fetchAssetSummary(),
      fetchAssets(),
    ]);
    setSummary(nextSummary);
    setAssets(nextAssets);
  }, []);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Unable to load assets');
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

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      style={styles.screen}
    >
      <Text style={styles.title}>Assets</Text>
      <Text style={styles.subtitle}>Demo balances for the sandbox portfolio.</Text>
      {error ? <ScreenError message={error} /> : null}
      <View style={styles.card}>
        <Text style={styles.label}>Estimated value</Text>
        <Text style={[styles.title, { marginBottom: 0 }]}>
          {formatUsd(summary?.totalEstimatedUsdValue ?? 0)}
        </Text>
        <Text style={styles.label}>{summary?.assetCount ?? 0} assets / sandbox data</Text>
      </View>
      {assets.map((asset) => (
        <View key={asset.id} style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.value}>{asset.token.symbol}</Text>
              <Text style={styles.label}>{asset.token.name}</Text>
            </View>
            <Text style={styles.value}>{formatUsd(asset.estimatedUsdValue)}</Text>
          </View>
          <Text style={styles.label}>
            Available {formatToken(asset.available, asset.token.symbol)}
          </Text>
          <Text style={styles.label}>
            Frozen {formatToken(asset.frozen, asset.token.symbol)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
