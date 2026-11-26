import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { FiX } from 'react-icons/fi';
import { commonStrings } from '../../strings/pt-br';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <>
      <button
        type="button"
        aria-label={commonStrings.closeModal}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 pt-16 transition-opacity duration-200 sm:items-center sm:p-6 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          className={`flex w-full max-w-md flex-col gap-4 rounded-xl bg-white p-5 shadow-xl ring-1 ring-zinc-200 transition-transform duration-200 ease-out ${
            isOpen ? 'translate-y-0' : 'translate-y-4'
          }`}
        >
          <header className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
              {description && (
                <p className="text-sm text-zinc-500">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={commonStrings.closeModal}
              className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              <FiX className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          {children}
        </div>
      </div>
    </>
  );
}

export default Modal;
