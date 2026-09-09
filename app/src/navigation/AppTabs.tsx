import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AssetsScreen } from '../screens/AssetsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { KycScreen } from '../screens/KycScreen';
import { MarketDetailScreen } from '../screens/MarketDetailScreen';
import { MarketsScreen } from '../screens/MarketsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TransactionDetailScreen } from '../screens/TransactionDetailScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { WalletsScreen } from '../screens/WalletsScreen';
import { colors } from '../theme/colors';

export type AppTabParamList = {
  Home: undefined;
  Markets: undefined;
  Assets: undefined;
  Transactions: undefined;
  Wallets: undefined;
  KYC: undefined;
  Profile: undefined;
};

export type MarketsStackParamList = {
  MarketsList: undefined;
  MarketDetail: { symbol: string };
};

export type TransactionsStackParamList = {
  TransactionsList: undefined;
  TransactionDetail: { id: string };
};

const Tab = createBottomTabNavigator<AppTabParamList>();
const MarketsStack = createNativeStackNavigator<MarketsStackParamList>();
const TransactionsStack = createNativeStackNavigator<TransactionsStackParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  contentStyle: { backgroundColor: colors.background },
};

function MarketsStackScreen() {
  return (
    <MarketsStack.Navigator screenOptions={stackScreenOptions}>
      <MarketsStack.Screen
        name="MarketsList"
        component={MarketsScreen}
        options={{ headerShown: false }}
      />
      <MarketsStack.Screen
        name="MarketDetail"
        component={MarketDetailScreen}
        options={({ route }) => ({ title: route.params.symbol })}
      />
    </MarketsStack.Navigator>
  );
}

function TransactionsStackScreen() {
  return (
    <TransactionsStack.Navigator screenOptions={stackScreenOptions}>
      <TransactionsStack.Screen
        name="TransactionsList"
        component={TransactionsScreen}
        options={{ headerShown: false }}
      />
      <TransactionsStack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ title: 'Transaction' }}
      />
    </TransactionsStack.Navigator>
  );
}

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
        name="Markets"
        component={MarketsStackScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="stats-chart-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Assets"
        component={AssetsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="pie-chart-outline" size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsStackScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="receipt-outline" size={size} />
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
