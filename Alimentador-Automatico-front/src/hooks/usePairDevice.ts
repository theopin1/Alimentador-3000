import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { deviceService } from '../services/device.service';
import type { ApiErrorPayload } from '../services/api';
import type { Device } from '../services/types';
import { commonStrings, devicesStrings } from '../strings/pt-br';

export interface PairDeviceFormState {
  serial_code: string;
  name: string;
}

export interface PairDeviceFieldErrors {
  serial_code?: string;
  name?: string;
}

export interface UsePairDeviceOptions {
  onSuccess?: (device: Device) => void;
}

const INITIAL_STATE: PairDeviceFormState = {
  serial_code: '',
  name: '',
};

const SERIAL_CODE_LENGTH = 16;

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'message' in value
  );
}

function validate(form: PairDeviceFormState): PairDeviceFieldErrors {
  const errors: PairDeviceFieldErrors = {};

  const serialCode = form.serial_code.trim();
  if (!serialCode) {
    errors.serial_code = devicesStrings.pair.validation.serialCodeRequired;
  } else if (serialCode.length !== SERIAL_CODE_LENGTH) {
    errors.serial_code = devicesStrings.pair.validation.serialCodeLength(
      SERIAL_CODE_LENGTH,
    );
  }

  if (form.name.trim().length > 100) {
    errors.name = devicesStrings.pair.validation.nameMaxLength;
  }

  return errors;
}

export function usePairDevice(options: UsePairDeviceOptions = {}) {
  const [form, setForm] = useState<PairDeviceFormState>(INITIAL_STATE);
  const [fieldErrors, setFieldErrors] = useState<PairDeviceFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name as keyof PairDeviceFieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (formError) {
      setFormError(null);
    }
  }

  function reset() {
    setForm(INITIAL_STATE);
    setFieldErrors({});
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const trimmedName = form.name.trim();
      const device = await deviceService.pair({
        serial_code: form.serial_code.trim(),
        ...(trimmedName ? { name: trimmedName } : {}),
      });
      reset();
      options.onSuccess?.(device);
    } catch (error) {
      if (isApiErrorPayload(error)) {
        if (error.errors) {
          const apiFieldErrors: PairDeviceFieldErrors = {};
          if (error.errors.serial_code?.length) {
            apiFieldErrors.serial_code = error.errors.serial_code[0];
          }
          if (error.errors.name?.length) {
            apiFieldErrors.name = error.errors.name[0];
          }
          setFieldErrors(apiFieldErrors);
        }
        setFormError(error.message);
      } else {
        setFormError(commonStrings.unexpectedError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    fieldErrors,
    formError,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
  };
}

export default usePairDevice;
