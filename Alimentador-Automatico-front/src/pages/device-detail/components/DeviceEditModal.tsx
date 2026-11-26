import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal, TextField, Button } from '../../../components/ui';
import { deviceService } from '../../../services/device.service';
import type { Device, UpdateDevicePayload } from '../../../services/types';
import { commonStrings, deviceDetailStrings } from '../../../strings/pt-br';

interface DeviceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
  onUpdated?: (device: Device) => void;
}

function toInputValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function DeviceEditModal({
  isOpen,
  onClose,
  device,
  onUpdated,
}: DeviceEditModalProps) {
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(device.name ?? '');
    setLat(toInputValue(device.location_lat));
    setLng(toInputValue(device.location_lng));
    setError(null);
    setIsSubmitting(false);
  }, [isOpen, device]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: UpdateDevicePayload = {};

    const trimmedName = name.trim();
    payload.name = trimmedName;

    if (lat.trim() !== '') {
      const latValue = Number(lat);
      if (!Number.isFinite(latValue) || latValue < -90 || latValue > 90) {
        setError(deviceDetailStrings.editModal.invalidLatitude);
        return;
      }
      payload.location_lat = latValue;
    }

    if (lng.trim() !== '') {
      const lngValue = Number(lng);
      if (!Number.isFinite(lngValue) || lngValue < -180 || lngValue > 180) {
        setError(deviceDetailStrings.editModal.invalidLongitude);
        return;
      }
      payload.location_lng = lngValue;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await deviceService.update(device.id, payload);
      onUpdated?.(updated);
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : deviceDetailStrings.editModal.saveError,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deviceDetailStrings.editModal.title}
      description={deviceDetailStrings.editModal.description}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          label={deviceDetailStrings.editModal.nameLabel}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={commonStrings.deviceFallbackName(device.id)}
          maxLength={120}
        />

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label={deviceDetailStrings.editModal.latitudeLabel}
            type="number"
            step="any"
            inputMode="decimal"
            value={lat}
            onChange={(event) => setLat(event.target.value)}
            placeholder={deviceDetailStrings.editModal.latitudePlaceholder}
          />
          <TextField
            label={deviceDetailStrings.editModal.longitudeLabel}
            type="number"
            step="any"
            inputMode="decimal"
            value={lng}
            onChange={(event) => setLng(event.target.value)}
            placeholder={deviceDetailStrings.editModal.longitudePlaceholder}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-1 flex gap-3">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="flex-1"
          >
            {commonStrings.save}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {commonStrings.cancel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default DeviceEditModal;
