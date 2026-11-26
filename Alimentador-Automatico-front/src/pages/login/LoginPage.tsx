import { useLogin } from '../../hooks/useLogin';
import { useAuth } from '../../hooks/useAuth';
import { AppLogo } from '../../components/AppLogo';
import { Divider } from '../../components/ui';
import { LoginForm } from './components/LoginForm';
import { SocialAuthButtons } from './components/SocialAuthButtons';
import { loginStrings } from '../../strings/pt-br';

interface LoginPageProps {
  onNavigateToRegister?: () => void;
}

export function LoginPage({ onNavigateToRegister }: LoginPageProps = {}) {
  const { signIn } = useAuth();

  const {
    form,
    fieldErrors,
    formError,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useLogin({
    onSuccess: (response) => {
      signIn(response.user, response.token);
    },
  });

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-white px-6 py-8">
      <div className="flex w-full max-w-sm flex-col gap-6 p-7 rounded-lg border-1">
        <AppLogo />

        <LoginForm
          form={form}
          fieldErrors={fieldErrors}
          formError={formError}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onRegisterClick={onNavigateToRegister}
        />

        <Divider label={loginStrings.socialDivider} />

        <SocialAuthButtons />
      </div>
    </main>
  );
}

export default LoginPage;
