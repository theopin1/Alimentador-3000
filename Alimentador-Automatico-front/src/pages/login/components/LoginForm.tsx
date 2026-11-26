import type { ChangeEvent, FormEvent } from 'react';
import { Button, TextField } from '../../../components/ui';
import type { LoginFieldErrors, LoginFormState } from '../../../hooks/useLogin';
import { commonStrings, loginStrings } from '../../../strings/pt-br';

interface LoginFormProps {
  form: LoginFormState;
  fieldErrors: LoginFieldErrors;
  formError: string | null;
  isSubmitting: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRegisterClick?: () => void;
}

export function LoginForm({
  form,
  fieldErrors,
  formError,
  isSubmitting,
  onChange,
  onSubmit,
  onRegisterClick,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <TextField
        label={loginStrings.emailLabel}
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        value={form.email}
        onChange={onChange}
        error={fieldErrors.email}
      />

      <TextField
        label={loginStrings.passwordLabel}
        type="password"
        name="password"
        autoComplete="current-password"
        value={form.password}
        onChange={onChange}
        error={fieldErrors.password}
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
          {loginStrings.submit}
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onRegisterClick}
          disabled={!onRegisterClick}
          title={onRegisterClick ? undefined : commonStrings.soon}
        >
          {loginStrings.goToRegister}
        </Button>
      </div>
    </form>
  );
}

export default LoginForm;
