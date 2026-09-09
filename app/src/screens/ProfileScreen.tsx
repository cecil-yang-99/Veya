import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../auth/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { styles } from '../theme/styles';

export function ProfileScreen() {
  const { logout, refreshProfile, user } = useAuth();

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Account details returned by the Veya API.</Text>
      <View style={styles.card}>
        <Text style={styles.label}>User code</Text>
        <Text style={styles.value}>{user?.userCode ?? '-'}</Text>
        <Text style={[styles.label, { marginTop: 14 }]}>User ID</Text>
        <Text style={styles.value}>{user?.id ?? '-'}</Text>
        <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
        <Text style={styles.value}>{user?.email ?? 'Not set'}</Text>
        <Text style={[styles.label, { marginTop: 14 }]}>KYC status</Text>
        <Text style={styles.value}>{user?.kycStatus ?? 'none'}</Text>
      </View>
      <PrimaryButton
        icon={<Ionicons color={colors.text} name="refresh-outline" size={20} />}
        variant="secondary"
        onPress={() => void refreshProfile()}
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
