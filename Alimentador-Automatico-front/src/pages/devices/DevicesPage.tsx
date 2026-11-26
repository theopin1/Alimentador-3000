import { FiPlus } from 'react-icons/fi';
import { InternalLayout } from '../../components/layout/InternalLayout';
import { useDevices } from '../../hooks/useDevices';
import { useDisclosure } from '../../hooks/useDisclosure';
import type { InternalRoute } from '../../router/types';
import type { ID } from '../../services/types';
import { DeviceCard } from './components/DeviceCard';
import { PairDeviceModal } from './components/PairDeviceModal';
import { commonStrings, devicesStrings } from '../../strings/pt-br';

interface DevicesPageProps {
  onNavigate: (route: InternalRoute) => void;
  onSelectDevice: (deviceId: ID) => void;
}

export function DevicesPage({ onNavigate, onSelectDevice }: DevicesPageProps) {
  const { devices, isLoading, error, refetch } = useDevices();
  const {
    isOpen: isPairModalOpen,
    onOpen: openPairModal,
    onClose: closePairModal,
  } = useDisclosure();

  return (
    <InternalLayout
      title={devicesStrings.title}
      currentRoute="devices"
      onNavigate={onNavigate}
    >
      {isLoading && (
        <p className="text-center text-sm text-zinc-500">
          {devicesStrings.loading}
        </p>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-center gap-3 rounded-md bg-red-50 px-4 py-6 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-900"
          >
            {commonStrings.retry}
          </button>
        </div>
      )}

      {!isLoading && !error && devices.length === 0 && (
        <p className="rounded-md bg-white px-4 py-8 text-center text-sm text-zinc-500 ring-1 ring-zinc-200">
          {devicesStrings.empty}
        </p>
      )}

      {!isLoading && !error && devices.length > 0 && (
        <ul className="flex flex-col gap-3">
          {devices.map((device) => (
            <li key={device.id}>
              <DeviceCard device={device} onSelect={onSelectDevice} />
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={openPairModal}
        aria-label={devicesStrings.addAriaLabel}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-white shadow-lg transition-colors hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
      >
        <FiPlus className="h-6 w-6" aria-hidden="true" />
      </button>

      <PairDeviceModal
        isOpen={isPairModalOpen}
        onClose={closePairModal}
        onSuccess={() => refetch()}
      />
    </InternalLayout>
  );
}

export default DevicesPage;
