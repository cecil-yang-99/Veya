import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';

export function LoadingScreen() {
  return (
    <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}
