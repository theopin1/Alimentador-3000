import type { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { commonStrings } from '../../strings/pt-br';

type ConfirmVariant = 'danger' | 'primary';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: ConfirmVariant;
}

const confirmClasses: Record<ConfirmVariant, string> = {
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-400',
  primary:
    'bg-zinc-700 text-white hover:bg-zinc-800 active:bg-zinc-900 disabled:bg-zinc-400',
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = commonStrings.confirm,
  cancelLabel = commonStrings.cancel,
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {description && <p className="text-sm text-zinc-600">{description}</p>}

      <div className="mt-1 flex gap-3">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${confirmClasses[variant]}`}
        >
          {isLoading ? commonStrings.loading : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
