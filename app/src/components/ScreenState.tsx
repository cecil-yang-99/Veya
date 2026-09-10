import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';

export function ScreenLoading() {
  return (
    <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

export function ScreenError({ message }: { message: string }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color: colors.danger }]}>{message}</Text>
    </View>
  );
}
