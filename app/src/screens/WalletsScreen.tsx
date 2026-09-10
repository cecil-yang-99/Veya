import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { bindWallet, fetchWallets, unbindWallet } from '../api/endpoints';
import type { WalletRecord } from '../api/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenError } from '../components/ScreenState';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';

export function WalletsScreen() {
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [chainId, setChainId] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setWallets(await fetchWallets());
  }, []);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Unable to load wallets');
    });
  }, [load]);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      await bindWallet(address, Number(chainId) || undefined, label || undefined);
      setAddress('');
      setLabel('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to bind wallet');
    } finally {
      setLoading(false);
    }
  }

  async function remove(wallet: WalletRecord) {
    try {
      await unbindWallet(wallet.id);
      await load();
    } catch (err) {
      Alert.alert(
        'Unable to unbind wallet',
        err instanceof Error ? err.message : 'Try again later',
      );
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
      <Text style={styles.title}>Wallets</Text>
      <Text style={styles.subtitle}>Manage EVM wallets bound to your account.</Text>
      {error ? <ScreenError message={error} /> : null}
      <View style={styles.card}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setAddress}
          placeholder="0x..."
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={address}
        />
        <Text style={styles.label}>Label</Text>
        <TextInput
          onChangeText={setLabel}
          placeholder="Main trading wallet"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={label}
        />
        <Text style={styles.label}>Chain ID</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={setChainId}
          placeholder="1"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={chainId}
        />
        <PrimaryButton
          icon={<Ionicons color={colors.text} name="add-circle-outline" size={20} />}
          loading={loading}
          onPress={submit}
        >
          Bind wallet
        </PrimaryButton>
      </View>
      {wallets.map((wallet) => (
        <View key={wallet.id} style={styles.card}>
          <Text style={styles.value}>{wallet.label ?? 'Wallet'}</Text>
          <Text style={[styles.subtitle, { marginBottom: 10 }]}>{wallet.address}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>
              {wallet.isPrimary ? 'Primary' : 'Secondary'} / chain {wallet.chainId ?? '-'}
            </Text>
            <PrimaryButton
              icon={<Ionicons color={colors.text} name="trash-outline" size={18} />}
              variant="danger"
              onPress={() => void remove(wallet)}
            >
              Unbind
            </PrimaryButton>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
