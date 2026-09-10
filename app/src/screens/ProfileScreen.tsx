import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import {
  fetchAssets,
  fetchAssetSummary,
  fetchMyKycSubmissions,
  fetchTransactions,
  fetchWallets,
} from '../api/endpoints';
import type {
  AssetBalanceRecord,
  AssetSummary,
  KycSubmissionRecord,
  UserTransactionRecord,
  WalletRecord,
} from '../api/types';
import { colors } from '../theme/colors';
import { useAuth } from '../auth/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenError } from '../components/ScreenState';
import { styles } from '../theme/styles';
import { formatToken, formatUsd } from '../utils/format';

export function ProfileScreen() {
  const { logout, refreshProfile, user } = useAuth();
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
  const [assetSummary, setAssetSummary] = useState<AssetSummary | null>(null);
  const [assets, setAssets] = useState<AssetBalanceRecord[]>([]);
  const [kycSubmissions, setKycSubmissions] = useState<KycSubmissionRecord[]>([]);
  const [transactions, setTransactions] = useState<UserTransactionRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    await refreshProfile();
    const [nextWallets, nextSummary, nextAssets, nextKyc, nextTransactions] =
      await Promise.all([
        fetchWallets().catch(() => []),
        fetchAssetSummary().catch(() => null),
        fetchAssets().catch(() => []),
        fetchMyKycSubmissions().catch(() => []),
        fetchTransactions(1, 10).then((page) => page.items).catch(() => []),
      ]);
    setWallets(nextWallets);
    setAssetSummary(nextSummary);
    setAssets(nextAssets);
    setKycSubmissions(nextKyc);
    setTransactions(nextTransactions);
  }, [refreshProfile]);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Unable to load profile');
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
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Complete account view for this Veya user.</Text>
      {error ? <ScreenError message={error} /> : null}
      <View style={styles.card}>
        <Text style={styles.label}>User code</Text>
        <Text style={styles.value}>{user?.userCode ?? '-'}</Text>
        <Text style={[styles.label, { marginTop: 14 }]}>User ID</Text>
        <Text style={styles.value}>{user?.id ?? '-'}</Text>
        <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
        <Text style={styles.value}>{user?.email ?? 'Not set'}</Text>
        <Text style={[styles.label, { marginTop: 14 }]}>Nickname</Text>
        <Text style={styles.value}>{user?.nickname ?? 'Not set'}</Text>
        <Text style={[styles.label, { marginTop: 14 }]}>Account status</Text>
        <Text style={styles.value}>{user?.status ?? '-'}</Text>
        <Text style={[styles.label, { marginTop: 14 }]}>KYC status</Text>
        <Text style={styles.value}>
          {user?.kycStatus ?? 'none'} / level {user?.kycLevel ?? 0}
        </Text>
        <Text style={[styles.label, { marginTop: 14 }]}>Last login</Text>
        <Text style={styles.value}>
          {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-'}
        </Text>
        <Text style={[styles.label, { marginTop: 14 }]}>Created</Text>
        <Text style={styles.value}>
          {user?.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
        </Text>
        <Text style={[styles.label, { marginTop: 14 }]}>Updated</Text>
        <Text style={styles.value}>
          {user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : '-'}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Portfolio</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Estimated value</Text>
        <Text style={[styles.title, { marginBottom: 4 }]}>
          {formatUsd(assetSummary?.totalEstimatedUsdValue ?? 0)}
        </Text>
        <Text style={styles.label}>
          {assetSummary?.assetCount ?? assets.length} assets / sandbox data
        </Text>
      </View>
      {assets.map((asset) => (
        <View key={asset.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.value}>{asset.token.symbol}</Text>
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

      <Text style={styles.sectionTitle}>Wallets</Text>
      {wallets.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.label}>No wallets found</Text>
        </View>
      ) : (
        wallets.map((wallet) => (
          <View key={wallet.id} style={styles.card}>
            <Text style={styles.value}>{wallet.label ?? 'Wallet'}</Text>
            <Text style={styles.label}>{wallet.address}</Text>
            <Text style={styles.label}>
              {wallet.isPrimary ? 'Primary' : 'Secondary'} / {wallet.chainType} / chain{' '}
              {wallet.chainId ?? '-'}
            </Text>
            <Text style={styles.label}>
              Last connected{' '}
              {wallet.lastConnectedAt
                ? new Date(wallet.lastConnectedAt).toLocaleString()
                : '-'}
            </Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>KYC submissions</Text>
      {kycSubmissions.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.label}>No KYC submissions</Text>
        </View>
      ) : (
        kycSubmissions.map((submission) => (
          <View key={submission.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.value}>{submission.fullName}</Text>
              <Text style={{ color: colors.primary }}>{submission.status}</Text>
            </View>
            <Text style={styles.label}>
              Level {submission.level} / {submission.documentType}
            </Text>
            <Text style={styles.label}>Country {submission.country}</Text>
            <Text style={styles.label}>Date of birth {submission.dateOfBirth}</Text>
            <Text style={styles.label}>
              Submitted {new Date(submission.createdAt).toLocaleString()}
            </Text>
            {submission.rejectReason ? (
              <Text style={[styles.value, { color: colors.danger }]}>
                {submission.rejectReason}
              </Text>
            ) : null}
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Recent transactions</Text>
      {transactions.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.label}>No transactions</Text>
        </View>
      ) : (
        transactions.map((transaction) => {
          const token = transaction.toToken ?? transaction.fromToken;
          const amount = transaction.toAmount ?? transaction.fromAmount ?? '0';
          return (
            <View key={transaction.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.value}>{transaction.type}</Text>
                <Text style={{ color: colors.success }}>{transaction.status}</Text>
              </View>
              <Text style={styles.label}>
                {token ? formatToken(amount, token.symbol) : '-'} /{' '}
                {formatUsd(transaction.usdValue)}
              </Text>
              <Text style={styles.label}>
                {transaction.network ?? '-'} / {new Date(transaction.createdAt).toLocaleString()}
              </Text>
            </View>
          );
        })
      )}

      <PrimaryButton
        icon={<Ionicons color={colors.text} name="refresh-outline" size={20} />}
        variant="secondary"
        onPress={() => void refresh()}
      >
        Refresh profile
      </PrimaryButton>
      <View style={{ height: 12 }} />
      <PrimaryButton
        icon={<Ionicons color={colors.text} name="log-out-outline" size={20} />}
        variant="danger"
        onPress={() => void logout()}
      >
        Log out
      </PrimaryButton>
    </ScrollView>
  );
}
