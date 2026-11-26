import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { authService } from '../services/auth.service';
import type { ApiErrorPayload } from '../services/api';
import type { AuthResponse } from '../services/types';
import { commonStrings, registerStrings } from '../strings/pt-br';

export interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterFieldErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

export interface UseRegisterOptions {
  onSuccess?: (response: AuthResponse) => void;
}

const INITIAL_STATE: RegisterFormState = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
};

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'message' in value
  );
}

function validate(form: RegisterFormState): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {};

  if (!form.name.trim()) {
    errors.name = registerStrings.validation.nameRequired;
  } else if (form.name.trim().length > 255) {
    errors.name = registerStrings.validation.nameMaxLength;
  }

  if (!form.email.trim()) {
    errors.email = registerStrings.validation.emailRequired;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = registerStrings.validation.emailInvalid;
  } else if (form.email.trim().length > 255) {
    errors.email = registerStrings.validation.emailMaxLength;
  }

  if (!form.password) {
    errors.password = registerStrings.validation.passwordRequired;
  } else if (form.password.length < 8) {
    errors.password = registerStrings.validation.passwordMinLength;
  }

  if (!form.password_confirmation) {
    errors.password_confirmation =
      registerStrings.validation.passwordConfirmationRequired;
  } else if (form.password_confirmation !== form.password) {
    errors.password_confirmation =
      registerStrings.validation.passwordConfirmationMismatch;
  }

  return errors;
}

export function useRegister(options: UseRegisterOptions = {}) {
  const [form, setForm] = useState<RegisterFormState>(INITIAL_STATE);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name as keyof RegisterFieldErrors]) {
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
      const response = await authService.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      options.onSuccess?.(response);
    } catch (error) {
      if (isApiErrorPayload(error)) {
        if (error.errors) {
          const apiFieldErrors: RegisterFieldErrors = {};
          if (error.errors.name?.length) {
            apiFieldErrors.name = error.errors.name[0];
          }
          if (error.errors.email?.length) {
            apiFieldErrors.email = error.errors.email[0];
          }
          if (error.errors.password?.length) {
            apiFieldErrors.password = error.errors.password[0];
          }
          if (error.errors.password_confirmation?.length) {
            apiFieldErrors.password_confirmation =
              error.errors.password_confirmation[0];
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

export default useRegister;
