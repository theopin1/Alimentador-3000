import { useContext } from 'react';
import { ToastContext, type ToastContextValue } from '../contexts/toast-context';
import { commonStrings } from '../strings/pt-br';

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error(commonStrings.providerError('useToast', 'ToastProvider'));
  }
  return ctx;
}

export default useToast;
