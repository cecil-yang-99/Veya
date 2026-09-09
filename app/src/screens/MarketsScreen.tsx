import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { fetchMarketCandles, fetchMarkets } from '../api/endpoints';
import type { MarketCandleRecord, MarketPairRecord } from '../api/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenError } from '../components/ScreenState';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';
import { formatPercent, formatUsd } from '../utils/format';

export function MarketsScreen() {
  const [markets, setMarkets] = useState<MarketPairRecord[]>([]);
  const [selected, setSelected] = useState<MarketPairRecord | null>(null);
  const [candles, setCandles] = useState<MarketCandleRecord[]>([]);
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

  async function selectMarket(market: MarketPairRecord) {
    setSelected(market);
    try {
      setCandles(await fetchMarketCandles(market.symbol, 12));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load candles');
    }
  }

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
          <View key={market.id} style={styles.card}>
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
            <View style={{ height: 12 }} />
            <PrimaryButton variant="secondary" onPress={() => void selectMarket(market)}>
              View candles
            </PrimaryButton>
          </View>
        );
      })}
      {selected ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{selected.symbol} candles</Text>
          {candles.map((candle) => (
            <View key={candle.id} style={[styles.row, { marginBottom: 8 }]}>
              <Text style={styles.label}>{new Date(candle.openedAt).toLocaleString()}</Text>
              <Text style={styles.value}>{formatUsd(candle.close)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
