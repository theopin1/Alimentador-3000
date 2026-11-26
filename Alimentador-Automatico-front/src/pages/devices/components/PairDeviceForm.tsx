import type { ChangeEvent, FormEvent } from 'react';
import { Button, TextField } from '../../../components/ui';
import type {
  PairDeviceFieldErrors,
  PairDeviceFormState,
} from '../../../hooks/usePairDevice';
import { commonStrings, devicesStrings } from '../../../strings/pt-br';

interface PairDeviceFormProps {
  form: PairDeviceFormState;
  fieldErrors: PairDeviceFieldErrors;
  formError: string | null;
  isSubmitting: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
}

export function PairDeviceForm({
  form,
  fieldErrors,
  formError,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
}: PairDeviceFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <TextField
        label={devicesStrings.pair.serialCodeLabel}
        type="text"
        name="serial_code"
        autoComplete="off"
        placeholder={devicesStrings.pair.serialCodePlaceholder}
        maxLength={16}
        value={form.serial_code}
        onChange={onChange}
        error={fieldErrors.serial_code}
      />

      <TextField
        label={devicesStrings.pair.nameLabel}
        type="text"
        name="name"
        autoComplete="off"
        placeholder={devicesStrings.pair.namePlaceholder}
        maxLength={100}
        value={form.name}
        onChange={onChange}
        error={fieldErrors.name}
      />

      {formError && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {formError}
        </p>
      )}

      <div className="mt-2 flex gap-3">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="flex-1"
        >
          {devicesStrings.pair.submit}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {commonStrings.cancel}
          </Button>
        )}
      </div>
    </form>
  );
}

export default PairDeviceForm;
