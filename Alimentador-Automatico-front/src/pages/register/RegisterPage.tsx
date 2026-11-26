import { useRegister } from '../../hooks/useRegister';
import { AppLogo } from '../../components/AppLogo';
import { RegisterForm } from './components/RegisterForm';
import { registerStrings } from '../../strings/pt-br';

interface RegisterPageProps {
  onRegisterSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export function RegisterPage({
  onRegisterSuccess,
  onNavigateToLogin,
}: RegisterPageProps = {}) {
  const {
    form,
    fieldErrors,
    formError,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useRegister({
    onSuccess: () => {
      onRegisterSuccess?.();
    },
  });

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-white px-6 py-8">
      <div className="flex w-full max-w-sm flex-col gap-6 p-7 rounded-lg border-1">
        <AppLogo />

        <RegisterForm
          form={form}
          fieldErrors={fieldErrors}
          formError={formError}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />

        <p className="text-center text-sm text-zinc-600">
          {registerStrings.alreadyHaveAccount}{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            disabled={!onNavigateToLogin}
            className="font-semibold text-zinc-800 underline underline-offset-2 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:text-zinc-400"
          >
            {registerStrings.goToLogin}
          </button>
        </p>
      </div>
    </main>
  );
}

export default RegisterPage;
