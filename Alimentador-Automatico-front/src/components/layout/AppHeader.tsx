import { FiMenu } from 'react-icons/fi';
import { AppLogo } from '../AppLogo';
import { layoutStrings } from '../../strings/pt-br';

interface AppHeaderProps {
  title: string;
  onMenuOpen: () => void;
}

export function AppHeader({ title, onMenuOpen }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex w-full items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3">
      <AppLogo size="sm" />
      <h1 className="flex-1 truncate text-lg font-semibold text-zinc-900">
        {title}
      </h1>
      <button
        type="button"
        onClick={onMenuOpen}
        aria-label={layoutStrings.openMenu}
        className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
      >
        <FiMenu className="h-6 w-6" aria-hidden="true" />
      </button>
    </header>
  );
}

export default AppHeader;
