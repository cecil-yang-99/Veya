import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { AppTabs } from './src/navigation/AppTabs';
import { AuthStack } from './src/navigation/AuthStack';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { colors } from './src/theme/colors';

function RootNavigator() {
  const { isBootstrapping, token } = useAuth();

  if (isBootstrapping) {
    return <LoadingScreen />;
  }

  return token ? <AppTabs /> : <AuthStack />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor={colors.background} />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
