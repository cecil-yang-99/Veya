import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { KycScreen } from '../screens/KycScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { WalletsScreen } from '../screens/WalletsScreen';
import { colors } from '../theme/colors';

export type AppTabParamList = {
  Home: undefined;
  Wallets: undefined;
  KYC: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="home-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Wallets"
        component={WalletsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="wallet-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="KYC"
        component={KycScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="document-text-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="person-circle-outline" size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
