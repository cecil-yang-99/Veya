import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchTransactions } from '../api/endpoints';
import type { UserTransactionRecord } from '../api/types';
import type { TransactionsStackParamList } from '../navigation/AppTabs';
import { ScreenError } from '../components/ScreenState';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';
import { formatToken } from '../utils/format';

type Props = NativeStackScreenProps<TransactionsStackParamList, 'TransactionsList'>;

export function TransactionsScreen({ navigation }: Props) {
  const [transactions, setTransactions] = useState<UserTransactionRecord[]>([]);
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
        return (
          <Pressable
            key={transaction.id}
            onPress={() => navigation.navigate('TransactionDetail', { id: transaction.id })}
            style={({ pressed }) => [
              styles.card,
              { opacity: pressed ? 0.75 : 1 },
            ]}
          >
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
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
