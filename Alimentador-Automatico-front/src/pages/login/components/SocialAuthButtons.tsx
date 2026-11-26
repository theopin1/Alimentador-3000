import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { Button } from '../../../components/ui';
import { commonStrings, loginStrings } from '../../../strings/pt-br';

export function SocialAuthButtons() {
  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="social"
        fullWidth
        disabled
        title={commonStrings.soon}
        leftIcon={<FcGoogle aria-hidden="true" />}
      >
        {loginStrings.continueWithGoogle}
      </Button>

      <button
        type="button"
        disabled
        title={commonStrings.soon}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1877F2] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#166fe0] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <FaFacebook className="text-lg" aria-hidden="true" />
        <span>{loginStrings.continueWithFacebook}</span>
      </button>
    </div>
  );
}

export default SocialAuthButtons;
