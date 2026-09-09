import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { fetchTransactions } from '../api/endpoints';
import type { UserTransactionRecord } from '../api/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenError } from '../components/ScreenState';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';
import { formatToken, formatUsd } from '../utils/format';

export function TransactionsScreen() {
  const [transactions, setTransactions] = useState<UserTransactionRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const page = await fetchTransactions(1, 20);
    setTransactions(page.items);
  }, []);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Unable to load transactions');
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
      <Text style={styles.title}>Transactions</Text>
      <Text style={styles.subtitle}>Sandbox ledger entries for this account.</Text>
      {error ? <ScreenError message={error} /> : null}
      {transactions.map((transaction) => {
        const token = transaction.toToken ?? transaction.fromToken;
        const amount = transaction.toAmount ?? transaction.fromAmount ?? '0';
        const expanded = selectedId === transaction.id;
        return (
          <View key={transaction.id} style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.value}>{transaction.type}</Text>
                <Text style={styles.label}>{new Date(transaction.createdAt).toLocaleString()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.value}>
                  {token ? formatToken(amount, token.symbol) : '-'}
                </Text>
                <Text style={{ color: colors.success }}>{transaction.status}</Text>
              </View>
            </View>
            {expanded ? (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.label}>USD value</Text>
                <Text style={styles.value}>{formatUsd(transaction.usdValue)}</Text>
                <Text style={styles.label}>Network</Text>
                <Text style={styles.value}>{transaction.network ?? '-'}</Text>
              </View>
            ) : null}
            <View style={{ height: 12 }} />
            <PrimaryButton
              variant="secondary"
              onPress={() => setSelectedId(expanded ? null : transaction.id)}
            >
              {expanded ? 'Hide details' : 'View details'}
            </PrimaryButton>
          </View>
        );
      })}
    </ScrollView>
  );
}
