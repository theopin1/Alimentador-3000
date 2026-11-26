import type { ReactNode } from 'react';
import { useDisclosure } from '../../hooks/useDisclosure';
import type { InternalRoute } from '../../router/types';
import { AppHeader } from './AppHeader';
import { SideMenu } from './SideMenu';

interface InternalLayoutProps {
  title: string;
  currentRoute: InternalRoute;
  onNavigate: (route: InternalRoute) => void;
  children: ReactNode;
}

export function InternalLayout({
  title,
  currentRoute,
  onNavigate,
  children,
}: InternalLayoutProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div className="flex min-h-svh w-full flex-col bg-zinc-50">
      <AppHeader title={title} onMenuOpen={onOpen} />
      <SideMenu
        isOpen={isOpen}
        onClose={onClose}
        currentRoute={currentRoute}
        onNavigate={onNavigate}
      />
      <main className="flex-1 px-4 py-5">{children}</main>
    </div>
  );
}

export default InternalLayout;
