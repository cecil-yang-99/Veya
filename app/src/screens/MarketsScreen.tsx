import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchMarkets } from '../api/endpoints';
import type { MarketPairRecord } from '../api/types';
import type { MarketsStackParamList } from '../navigation/AppTabs';
import { ScreenError } from '../components/ScreenState';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';
import { formatPercent, formatUsd } from '../utils/format';

type Props = NativeStackScreenProps<MarketsStackParamList, 'MarketsList'>;

export function MarketsScreen({ navigation }: Props) {
  const [markets, setMarkets] = useState<MarketPairRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setMarkets(await fetchMarkets());
  }, []);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Unable to load markets');
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
      <Text style={styles.title}>Markets</Text>
      <Text style={styles.subtitle}>Sandbox prices and 24h activity.</Text>
      {error ? <ScreenError message={error} /> : null}
      {markets.map((market) => {
        const positive = Number(market.change24h) >= 0;
        return (
          <Pressable
            key={market.id}
            onPress={() => navigation.navigate('MarketDetail', { symbol: market.symbol })}
            style={({ pressed }) => [
              styles.card,
              { opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <View style={styles.row}>
              <View>
                <Text style={styles.value}>{market.symbol}</Text>
                <Text style={styles.label}>Vol {market.volume24h}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.value}>{formatUsd(market.lastPrice)}</Text>
                <Text style={{ color: positive ? colors.success : colors.danger }}>
                  {formatPercent(market.change24h)}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
