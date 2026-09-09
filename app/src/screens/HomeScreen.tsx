import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { FeatureModuleCode } from '@veya/shared';
import { fetchEnabledModules } from '../api/endpoints';
import type { FeatureModuleRecord } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ScreenError } from '../components/ScreenState';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';

export function HomeScreen() {
  const { refreshProfile, user } = useAuth();
  const [modules, setModules] = useState<FeatureModuleRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const [enabled] = await Promise.all([fetchEnabledModules(), refreshProfile()]);
    setModules(enabled);
  }, [refreshProfile]);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Unable to load home');
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

  const moduleCodes = new Set(modules.map((module) => module.code));

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      style={styles.screen}
    >
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Your Veya account at a glance.</Text>
      {error ? <ScreenError message={error} /> : null}
      <View style={styles.card}>
        <Text style={styles.label}>User code</Text>
        <Text style={styles.value}>{user?.userCode ?? 'Unknown'}</Text>
        <Text style={[styles.label, { marginTop: 14 }]}>Account status</Text>
        <Text style={styles.value}>{user?.status ?? 'unknown'}</Text>
        <Text style={[styles.label, { marginTop: 14 }]}>KYC</Text>
        <Text style={styles.value}>
          {user?.kycStatus ?? 'none'} / level {user?.kycLevel ?? 0}
        </Text>
      </View>
      <Text style={styles.sectionTitle}>Enabled modules</Text>
      {Object.values(FeatureModuleCode).map((code) => {
        const enabled = moduleCodes.has(code);
        return (
          <View key={code} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.value}>{code}</Text>
              <Text style={{ color: enabled ? colors.success : colors.muted }}>
                {enabled ? 'Enabled' : 'Unavailable'}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
