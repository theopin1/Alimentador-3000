import { SiDatadog } from 'react-icons/si';
import { commonStrings } from '../strings/pt-br';

type AppLogoSize = 'sm' | 'md' | 'lg';

interface AppLogoProps {
  label?: string;
  size?: AppLogoSize;
}

const SIZE_CLASSES: Record<AppLogoSize, { container: string; icon: string }> = {
  sm: { container: 'h-10 w-10', icon: 'h-5 w-5' },
  md: { container: 'h-16 w-16', icon: 'h-8 w-8' },
  lg: { container: 'h-32 w-32', icon: 'h-16 w-16' },
};

export function AppLogo({
  label = commonStrings.appLogoLabel,
  size = 'lg',
}: AppLogoProps) {
  const { container, icon } = SIZE_CLASSES[size];

  return (
    <div className="flex justify-center">
      <div
        className={`flex items-center justify-center rounded-full bg-zinc-300 text-zinc-700 shadow-sm ${container}`}
        aria-label={label}
      >
        <SiDatadog className={icon} aria-hidden="true" />
      </div>
    </div>
  );
}

export default AppLogo;
