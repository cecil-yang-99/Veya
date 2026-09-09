import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { KycDocumentType } from '@veya/shared';
import { fetchMyKycSubmissions, submitKyc } from '../api/endpoints';
import type { KycSubmissionRecord } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenError } from '../components/ScreenState';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';

interface PickedDocument {
  uri: string;
  name: string;
  mimeType: string;
}

export function KycScreen() {
  const { refreshProfile } = useAuth();
  const [submissions, setSubmissions] = useState<KycSubmissionRecord[]>([]);
  const [fullName, setFullName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [country, setCountry] = useState('US');
  const [dateOfBirth, setDateOfBirth] = useState('1990-01-01');
  const [document, setDocument] = useState<PickedDocument | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setSubmissions(await fetchMyKycSubmissions());
  }, []);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Unable to load KYC');
    });
  }, [load]);

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setDocument({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? 'application/octet-stream',
      });
    }
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      await submitKyc({
        level: 1,
        fullName,
        documentType: KycDocumentType.PASSPORT,
        documentNumber,
        country,
        dateOfBirth,
        document,
      });
      setFullName('');
      setDocumentNumber('');
      setDocument(undefined);
      await Promise.all([load(), refreshProfile()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit KYC');
    } finally {
      setLoading(false);
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
      <Text style={styles.title}>KYC</Text>
      <Text style={styles.subtitle}>Submit identity details for compliance review.</Text>
      {error ? <ScreenError message={error} /> : null}
      <View style={styles.card}>
        <Text style={styles.label}>Full name</Text>
        <TextInput
          onChangeText={setFullName}
          placeholder="Ada Lovelace"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={fullName}
        />
        <Text style={styles.label}>Document number</Text>
        <TextInput
          autoCapitalize="characters"
          onChangeText={setDocumentNumber}
          placeholder="P1234567"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={documentNumber}
        />
        <Text style={styles.label}>Country</Text>
        <TextInput
          autoCapitalize="characters"
          maxLength={2}
          onChangeText={setCountry}
          placeholder="US"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={country}
        />
        <Text style={styles.label}>Date of birth</Text>
        <TextInput
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={dateOfBirth}
        />
        <PrimaryButton
          icon={<Ionicons color={colors.text} name="attach-outline" size={20} />}
          variant="secondary"
          onPress={() => void pickDocument()}
        >
          {document ? document.name : 'Choose document'}
        </PrimaryButton>
        <View style={{ height: 12 }} />
        <PrimaryButton
          icon={<Ionicons color={colors.text} name="cloud-upload-outline" size={20} />}
          loading={loading}
          onPress={submit}
        >
          Submit KYC
        </PrimaryButton>
      </View>
      <Text style={styles.sectionTitle}>Submission history</Text>
      {submissions.map((submission) => (
        <View key={submission.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.value}>{submission.fullName}</Text>
            <Text style={{ color: colors.primary }}>{submission.status}</Text>
          </View>
          <Text style={styles.subtitle}>
            Level {submission.level} / {submission.documentType} / {submission.createdAt}
          </Text>
          {submission.rejectReason ? (
            <Text style={[styles.value, { color: colors.danger }]}>
              {submission.rejectReason}
            </Text>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}
