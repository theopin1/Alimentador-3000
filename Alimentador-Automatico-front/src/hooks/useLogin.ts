import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { authService } from '../services/auth.service';
import type { ApiErrorPayload } from '../services/api';
import type { AuthResponse } from '../services/types';
import { commonStrings, loginStrings } from '../strings/pt-br';

export interface LoginFormState {
  email: string;
  password: string;
}

export interface LoginFieldErrors {
  email?: string;
  password?: string;
}

export interface UseLoginOptions {
  onSuccess?: (response: AuthResponse) => void;
}

const INITIAL_STATE: LoginFormState = {
  email: '',
  password: '',
};

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'message' in value
  );
}

function validate(form: LoginFormState): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  if (!form.email.trim()) {
    errors.email = loginStrings.validation.emailRequired;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = loginStrings.validation.emailInvalid;
  }

  if (!form.password) {
    errors.password = loginStrings.validation.passwordRequired;
  } else if (form.password.length < 8) {
    errors.password = loginStrings.validation.passwordMinLength;
  }

  return errors;
}

export function useLogin(options: UseLoginOptions = {}) {
  const [form, setForm] = useState<LoginFormState>(INITIAL_STATE);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name as keyof LoginFieldErrors]) {
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
      const response = await authService.login({
        email: form.email.trim(),
        password: form.password,
      });
      options.onSuccess?.(response);
    } catch (error) {
      if (isApiErrorPayload(error)) {
        if (error.errors) {
          const apiFieldErrors: LoginFieldErrors = {};
          if (error.errors.email?.length) {
            apiFieldErrors.email = error.errors.email[0];
          }
          if (error.errors.password?.length) {
            apiFieldErrors.password = error.errors.password[0];
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

export default useLogin;
