import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { setApiToken } from '../api/client';
import { fetchProfile, requestWalletNonce, verifyWallet } from '../api/endpoints';
import type { UserProfile } from '../api/types';
import { buildMockSignature } from './mockSignature';

const TOKEN_KEY = 'veya.accessToken';

interface AuthContextValue {
  isBootstrapping: boolean;
  token: string | null;
  user: UserProfile | null;
  loginWithWallet: (address: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  const persistToken = useCallback(async (nextToken: string | null) => {
    setToken(nextToken);
    setApiToken(nextToken);
    if (nextToken) {
      await AsyncStorage.setItem(TOKEN_KEY, nextToken);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await fetchProfile();
    setUser(profile);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        setApiToken(storedToken);
        setToken(storedToken);
        try {
          const profile = await fetchProfile();
          setUser(profile);
        } catch {
          await AsyncStorage.removeItem(TOKEN_KEY);
          setApiToken(null);
          setToken(null);
        }
      }
      setIsBootstrapping(false);
    }

    void bootstrap();
  }, []);

  const loginWithWallet = useCallback(
    async (rawAddress: string) => {
      const address = rawAddress.trim().toLowerCase();
      const challenge = await requestWalletNonce(address);
      const signature = buildMockSignature(challenge.address, challenge.nonce);
      const result = await verifyWallet(challenge.address, signature);
      await persistToken(result.accessToken);
      setUser(result.user);
    },
    [persistToken],
  );

  const logout = useCallback(async () => {
    setUser(null);
    await persistToken(null);
  }, [persistToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isBootstrapping,
      token,
      user,
      loginWithWallet,
      refreshProfile,
      logout,
    }),
    [isBootstrapping, loginWithWallet, logout, refreshProfile, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}
