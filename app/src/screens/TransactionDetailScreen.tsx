import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { fetchTransaction } from '../api/endpoints';
import type { UserTransactionRecord } from '../api/types';
import type { TransactionsStackParamList } from '../navigation/AppTabs';
import { ScreenError } from '../components/ScreenState';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';
import { formatToken, formatUsd } from '../utils/format';

type Props = NativeStackScreenProps<TransactionsStackParamList, 'TransactionDetail'>;

export function TransactionDetailScreen({ route }: Props) {
  const { id } = route.params;
  const [transaction, setTransaction] = useState<UserTransactionRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setTransaction(await fetchTransaction(id));
  }, [id]);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Unable to load transaction');
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

  const token = transaction?.toToken ?? transaction?.fromToken;
  const amount = transaction?.toAmount ?? transaction?.fromAmount ?? '0';

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      style={styles.screen}
    >
      <Text style={styles.title}>Transaction</Text>
      <Text style={styles.subtitle}>{id}</Text>
      {error ? <ScreenError message={error} /> : null}
      {transaction ? (
        <>
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Type</Text>
                <Text style={styles.value}>{transaction.type}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>Status</Text>
                <Text style={{ color: colors.success }}>{transaction.status}</Text>
              </View>
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>
              {token ? formatToken(amount, token.symbol) : '-'}
            </Text>
            <Text style={[styles.label, { marginTop: 12 }]}>USD value</Text>
            <Text style={styles.value}>{formatUsd(transaction.usdValue)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Network</Text>
            <Text style={styles.value}>{transaction.network ?? '-'}</Text>
            <Text style={[styles.label, { marginTop: 12 }]}>Wallet</Text>
            <Text style={styles.value}>{transaction.wallet?.address ?? '-'}</Text>
            <Text style={[styles.label, { marginTop: 12 }]}>Transaction hash</Text>
            <Text style={styles.value}>{transaction.txHash ?? '-'}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.value}>
              {new Date(transaction.createdAt).toLocaleString()}
            </Text>
            <Text style={[styles.label, { marginTop: 12 }]}>Updated</Text>
            <Text style={styles.value}>
              {new Date(transaction.updatedAt).toLocaleString()}
            </Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
