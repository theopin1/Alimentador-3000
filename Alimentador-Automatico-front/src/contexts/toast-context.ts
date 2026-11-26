import { createContext } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

export interface ShowToastOptions {
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, options?: ShowToastOptions) => string;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined,
);
