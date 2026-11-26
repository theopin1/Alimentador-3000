import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { tokenStorage } from '../services/api';
import type { User } from '../services/types';
import { AuthContext, type AuthContextValue } from './auth-context';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(
    () => tokenStorage.get() !== null,
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!tokenStorage.get()) {
        setIsBootstrapping(false);
        return;
      }
      try {
        const me = await authService.me();
        if (!cancelled) setUser(me);
      } catch {
        tokenStorage.clear();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback((nextUser: User, token: string) => {
    tokenStorage.set(token);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      tokenStorage.clear();
    }
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isBootstrapping,
      signIn,
      signOut,
    }),
    [user, isBootstrapping, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
