import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { fetchMarket, fetchMarketCandles } from '../api/endpoints';
import type { MarketCandleRecord, MarketPairRecord } from '../api/types';
import type { MarketsStackParamList } from '../navigation/AppTabs';
import { ScreenError } from '../components/ScreenState';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';
import { formatPercent, formatUsd } from '../utils/format';

type Props = NativeStackScreenProps<MarketsStackParamList, 'MarketDetail'>;

export function MarketDetailScreen({ route }: Props) {
  const { symbol } = route.params;
  const [market, setMarket] = useState<MarketPairRecord | null>(null);
  const [candles, setCandles] = useState<MarketCandleRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const [nextMarket, nextCandles] = await Promise.all([
      fetchMarket(symbol),
      fetchMarketCandles(symbol, 24),
    ]);
    setMarket(nextMarket);
    setCandles(nextCandles);
  }, [symbol]);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Unable to load market');
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

  const positive = Number(market?.change24h ?? 0) >= 0;

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      style={styles.screen}
    >
      <Text style={styles.title}>{symbol}</Text>
      <Text style={styles.subtitle}>Sandbox market details and hourly candles.</Text>
      {error ? <ScreenError message={error} /> : null}
      {market ? (
        <View style={styles.card}>
          <Text style={styles.label}>Last price</Text>
          <Text style={[styles.title, { marginBottom: 12 }]}>
            {formatUsd(market.lastPrice)}
          </Text>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>24h change</Text>
              <Text style={{ color: positive ? colors.success : colors.danger }}>
                {formatPercent(market.change24h)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.label}>24h volume</Text>
              <Text style={styles.value}>{market.volume24h}</Text>
            </View>
          </View>
        </View>
      ) : null}
      <Text style={styles.sectionTitle}>Hourly candles</Text>
      {candles.map((candle) => (
        <View key={candle.id} style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.value}>{new Date(candle.openedAt).toLocaleString()}</Text>
              <Text style={styles.label}>Vol {candle.volume}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.value}>{formatUsd(candle.close)}</Text>
              <Text style={styles.label}>
                H {formatUsd(candle.high)} / L {formatUsd(candle.low)}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
