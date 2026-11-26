import { useEffect, useState } from 'react';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiXCircle,
  FiX,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import type { Toast as ToastData, ToastVariant } from '../../contexts/toast-context';
import { layoutStrings } from '../../strings/pt-br';

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: string; Icon: IconType }
> = {
  success: {
    container: 'bg-emerald-50 ring-emerald-200 text-emerald-800',
    icon: 'text-emerald-500',
    Icon: FiCheckCircle,
  },
  error: {
    container: 'bg-red-50 ring-red-200 text-red-800',
    icon: 'text-red-500',
    Icon: FiXCircle,
  },
  warning: {
    container: 'bg-amber-50 ring-amber-200 text-amber-800',
    icon: 'text-amber-500',
    Icon: FiAlertTriangle,
  },
  info: {
    container: 'bg-zinc-50 ring-zinc-200 text-zinc-800',
    icon: 'text-zinc-500',
    Icon: FiInfo,
  },
};

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const styles = variantStyles[toast.variant];
  const { Icon } = styles;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl px-4 py-3 shadow-lg ring-1 transition-all duration-300 ease-out ${
        styles.container
      } ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${styles.icon}`} aria-hidden="true" />
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label={layoutStrings.toastDismiss}
        className="-mr-1 -mt-1 rounded-md p-1 text-current/70 transition-colors hover:bg-black/5"
      >
        <FiX className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4 pt-4 sm:pt-6">
      <div className="flex w-full max-w-md flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}

export default ToastContainer;
