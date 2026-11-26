import { useEffect } from 'react';
import { Modal } from '../../../components/ui';
import { usePairDevice } from '../../../hooks/usePairDevice';
import type { Device } from '../../../services/types';
import { PairDeviceForm } from './PairDeviceForm';
import useToast from '../../../hooks/useToast';
import { devicesStrings } from '../../../strings/pt-br';

interface PairDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (device: Device) => void;
}

export function PairDeviceModal({
  isOpen,
  onClose,
  onSuccess,
}: PairDeviceModalProps) {
  const { showToast } = useToast();

  const {
    form,
    fieldErrors,
    formError,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
  } = usePairDevice({
    onSuccess: (device) => {
      showToast(devicesStrings.pair.success, { variant: 'success' });
      onSuccess?.(device);
      onClose();
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  function handleCancel() {
    if (isSubmitting) return;
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={devicesStrings.pair.title}
      description={devicesStrings.pair.description}
    >
      <PairDeviceForm
        form={form}
        fieldErrors={fieldErrors}
        formError={formError}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Modal>
  );
}

export default PairDeviceModal;
