import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../contexts/auth-context';
import { commonStrings } from '../strings/pt-br';

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(commonStrings.providerError('useAuth', 'AuthProvider'));
  }
  return ctx;
}

export default useAuth;
