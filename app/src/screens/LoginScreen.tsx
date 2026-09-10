import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { ApiError, getApiBaseUrl } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';

const DEFAULT_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

export function LoginScreen() {
  const { loginWithWallet } = useAuth();
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      await loginWithWallet(address);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to sign in';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { justifyContent: 'center' }]}
    >
      <Text style={styles.title}>Veya</Text>
      <Text style={styles.subtitle}>Sign in with a local development wallet signature.</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Wallet address</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setAddress}
          placeholder="0x..."
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={address}
        />
        {error ? (
          <Text style={[styles.value, { color: colors.danger, marginBottom: 12 }]}>
            {error}
          </Text>
        ) : null}
        <PrimaryButton
          icon={<Ionicons color={colors.text} name="wallet-outline" size={20} />}
          loading={loading}
          onPress={submit}
        >
          Connect wallet
        </PrimaryButton>
      </View>
      <Text style={[styles.subtitle, { fontSize: 12 }]}>API: {getApiBaseUrl()}</Text>
    </KeyboardAvoidingView>
  );
}
