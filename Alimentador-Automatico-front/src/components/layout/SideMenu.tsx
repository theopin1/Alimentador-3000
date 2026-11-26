import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { FiBell, FiClock, FiLogOut, FiList, FiX } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadAlerts } from '../../hooks/useUnreadAlerts';
import { AppLogo } from '../AppLogo';
import type { InternalRoute } from '../../router/types';
import { commonStrings, layoutStrings } from '../../strings/pt-br';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: InternalRoute;
  onNavigate: (route: InternalRoute) => void;
}

interface MenuItem {
  route: InternalRoute;
  label: string;
  icon: ReactNode;
}

const MENU_ITEMS: MenuItem[] = [
  { route: 'devices', label: layoutStrings.menu.devices, icon: <FiList /> },
  { route: 'history', label: layoutStrings.menu.history, icon: <FiClock /> },
  { route: 'alerts', label: layoutStrings.menu.alerts, icon: <FiBell /> },
];

export function SideMenu({
  isOpen,
  onClose,
  currentRoute,
  onNavigate,
}: SideMenuProps) {
  const { user, signOut } = useAuth();
  const { hasUnread } = useUnreadAlerts();

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  function handleNavigate(route: InternalRoute) {
    onNavigate(route);
    onClose();
  }

  async function handleSignOut() {
    onClose();
    await signOut();
  }

  return (
    <>
      <button
        type="button"
        aria-label={layoutStrings.closeMenu}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 z-50 flex h-full w-72 max-w-[85%] flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end p-3">
          <button
            type="button"
            onClick={onClose}
            aria-label={layoutStrings.closeMenu}
            className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 px-6 pb-6">
          <AppLogo size="md" />
          <div className="text-center">
            <p className="text-base font-semibold text-zinc-900">
              {user?.name ?? layoutStrings.guest}
            </p>
            <p className="text-sm text-zinc-500">
              {user?.email ?? commonStrings.emptyValue}
            </p>
          </div>
        </div>

        <hr className="border-zinc-200" />

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {MENU_ITEMS.map((item) => {
            const isActive = currentRoute === item.route;
            const showUnreadDot = item.route === 'alerts' && hasUnread;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleNavigate(item.route)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                  isActive
                    ? 'bg-zinc-200 text-zinc-900'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <span className="relative text-lg" aria-hidden="true">
                  {item.icon}
                  {showUnreadDot && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </span>
                <span className="flex items-center gap-2">
                  {item.label}
                  {showUnreadDot && (
                    <span className="sr-only">{layoutStrings.hasUnreadAlerts}</span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <FiLogOut className="text-lg" aria-hidden="true" />
            <span>{layoutStrings.signOut}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default SideMenu;
