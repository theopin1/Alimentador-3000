import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { DevicesPage } from './pages/devices';
import { DeviceDetailPage } from './pages/device-detail';
import { HistoryPage } from './pages/history';
import { AlertsPage } from './pages/alerts';
import type { InternalRoute, PublicRoute } from './router/types';
import type { ID } from './services/types';
import { commonStrings } from './strings/pt-br';

function PublicRoutes() {
  const [route, setRoute] = useState<PublicRoute>('login');

  if (route === 'register') {
    return (
      <RegisterPage
        onRegisterSuccess={() => setRoute('login')}
        onNavigateToLogin={() => setRoute('login')}
      />
    );
  }

  return <LoginPage onNavigateToRegister={() => setRoute('register')} />;
}

function InternalRoutes() {
  const [route, setRoute] = useState<InternalRoute>('devices');
  const [selectedDeviceId, setSelectedDeviceId] = useState<ID | null>(null);

  function handleSelectDevice(deviceId: ID) {
    setSelectedDeviceId(deviceId);
    setRoute('device-detail');
  }

  if (route === 'history') {
    return (
      <HistoryPage onNavigate={setRoute} initialDeviceId={selectedDeviceId} />
    );
  }

  if (route === 'alerts') {
    return <AlertsPage onNavigate={setRoute} />;
  }

  if (route === 'device-detail' && selectedDeviceId !== null) {
    return (
      <DeviceDetailPage
        deviceId={selectedDeviceId}
        onNavigate={setRoute}
        onBack={() => setRoute('devices')}
      />
    );
  }

  return (
    <DevicesPage onNavigate={setRoute} onSelectDevice={handleSelectDevice} />
  );
}

function BootstrapScreen() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-white">
      <p className="text-sm text-zinc-500">{commonStrings.loading}</p>
    </div>
  );
}

function AppRouter() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <BootstrapScreen />;
  }

  return isAuthenticated ? <InternalRoutes /> : <PublicRoutes />;
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
