import type { ChangeEvent, FormEvent } from 'react';
import { Button, TextField } from '../../../components/ui';
import type {
  RegisterFieldErrors,
  RegisterFormState,
} from '../../../hooks/useRegister';
import { commonStrings, registerStrings } from '../../../strings/pt-br';

interface RegisterFormProps {
  form: RegisterFormState;
  fieldErrors: RegisterFieldErrors;
  formError: string | null;
  isSubmitting: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
}

export function RegisterForm({
  form,
  fieldErrors,
  formError,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
}: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <TextField
        label={registerStrings.nameLabel}
        type="text"
        name="name"
        autoComplete="name"
        value={form.name}
        onChange={onChange}
        error={fieldErrors.name}
      />

      <TextField
        label={registerStrings.emailLabel}
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        value={form.email}
        onChange={onChange}
        error={fieldErrors.email}
      />

      <TextField
        label={registerStrings.passwordLabel}
        type="password"
        name="password"
        autoComplete="new-password"
        value={form.password}
        onChange={onChange}
        error={fieldErrors.password}
      />

      <TextField
        label={registerStrings.passwordConfirmationLabel}
        type="password"
        name="password_confirmation"
        autoComplete="new-password"
        value={form.password_confirmation}
        onChange={onChange}
        error={fieldErrors.password_confirmation}
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
          {registerStrings.submit}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
          >
            {commonStrings.cancel}
          </Button>
        )}
      </div>
    </form>
  );
}

export default RegisterForm;
