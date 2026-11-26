import {
  FiArrowLeft,
  FiBattery,
  FiClock,
  FiDroplet,
  FiEdit2,
  FiLoader,
  FiThermometer,
} from 'react-icons/fi';
import { LuHistory, LuPlay } from 'react-icons/lu';
import type { ReactNode } from 'react';
import { InternalLayout } from '../../components/layout/InternalLayout';
import { useDeviceDetail } from '../../hooks/useDeviceDetail';
import { useManualFeed } from '../../hooks/useManualFeed';
import { useDisclosure } from '../../hooks/useDisclosure';
import { useToast } from '../../hooks/useToast';
import type { InternalRoute } from '../../router/types';
import type { FeedingEvent, ID, TelemetryReading } from '../../services/types';
import { ConfirmDialog } from '../../components/ui';
import { ReservoirGauge } from './components/ReservoirGauge';
import { SchedulesSection } from './components/SchedulesSection';
import { DeviceEditModal } from './components/DeviceEditModal';
import { commonStrings, deviceDetailStrings } from '../../strings/pt-br';

interface DeviceDetailPageProps {
  deviceId: ID;
  onNavigate: (route: InternalRoute) => void;
  onBack: () => void;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'string' ? Number(value) : value;
  return Number.isNaN(parsed) ? null : parsed;
}

function formatLastFeeding(event: FeedingEvent | null): string {
  const date = event?.executed_at ?? event?.created_at;
  if (!date) return commonStrings.emptyValue;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return commonStrings.emptyValue;
  return parsed.toLocaleString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface QuadrantProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function Quadrant({ icon, label, value }: QuadrantProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-zinc-100/80 px-4 py-3">
      <div className="flex items-center gap-2 text-zinc-500">
        <span aria-hidden="true">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-lg font-semibold text-zinc-900">{value}</span>
    </div>
  );
}

function formatTelemetry(
  telemetry: TelemetryReading | null,
): { humidity: string; temperature: string; battery: string; reservoir: number | null } {
  const humidity = toNumber(telemetry?.humidity);
  const temperature = toNumber(telemetry?.temperature);
  const battery = toNumber(telemetry?.battery_voltage);
  const reservoir = toNumber(telemetry?.reservoir_level_percentage);

  return {
    humidity:
      humidity === null ? commonStrings.emptyValue : `${Math.round(humidity)} %`,
    temperature:
      temperature === null
        ? commonStrings.emptyValue
        : `${Math.round(temperature)} °C`,
    battery:
      battery === null ? commonStrings.emptyValue : `${battery.toFixed(1)} V`,
    reservoir,
  };
}

export function DeviceDetailPage({
  deviceId,
  onNavigate,
  onBack,
}: DeviceDetailPageProps) {
  const { device, telemetry, latestFeeding, isLoading, error, refetch } =
    useDeviceDetail(deviceId);
  const { feed, isFeeding } = useManualFeed();
  const { showToast } = useToast();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isFeedConfirmOpen,
    onOpen: onFeedConfirmOpen,
    onClose: onFeedConfirmClose,
  } = useDisclosure();

  const displayName =
    device?.name?.trim() || commonStrings.deviceFallbackName(deviceId);
  const metrics = formatTelemetry(telemetry);

  async function handleConfirmFeed() {
    try {
      await feed(deviceId);
      showToast(commonStrings.feed.success(displayName), {
        variant: 'success',
      });
      onFeedConfirmClose();
      refetch();
    } catch (feedError) {
      const message =
        feedError instanceof Error ? feedError.message : commonStrings.feed.error;
      showToast(message, { variant: 'error' });
    }
  }

  return (
    <InternalLayout
      title={deviceDetailStrings.title}
      currentRoute="device-detail"
      onNavigate={onNavigate}
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
      >
        <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
        {deviceDetailStrings.back}
      </button>

      {isLoading && (
        <p className="text-center text-sm text-zinc-500">
          {deviceDetailStrings.loading}
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

      {!isLoading && !error && device && (
        <div className="flex flex-col gap-5 pb-28">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">{displayName}</h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              {deviceDetailStrings.idLabel(device.serial_code)}
            </p>
          </div>

          <ReservoirGauge percent={metrics.reservoir} />

          <div className="grid grid-cols-2 w-full gap-3">
          <Quadrant
              icon={<FiDroplet className="h-4 w-4" />}
              label={deviceDetailStrings.humidity}
              value={metrics.humidity}
            />              
            <Quadrant
              icon={<FiThermometer className="h-4 w-4" />}
              label={deviceDetailStrings.temperature}
              value={metrics.temperature}
            />    
            <Quadrant
              icon={<FiBattery className="h-4 w-4" />}
              label={deviceDetailStrings.battery}
              value={metrics.battery}
            />  
            <Quadrant
              icon={<FiClock className="h-4 w-4" />}
              label={deviceDetailStrings.lastFeeding}
              value={formatLastFeeding(latestFeeding)}
            />  

          </div>

          <SchedulesSection deviceId={deviceId} />
        </div>
      )}

      {!isLoading && !error && device && (
        <>
          <nav
            aria-label={deviceDetailStrings.actionsAriaLabel}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 backdrop-blur"
          >
            <div className="mx-auto flex max-w-md items-end justify-between px-8 py-3">
              <button
                type="button"
                onClick={onEditOpen}
                className="flex flex-1 flex-col items-center gap-1 text-zinc-500 transition-colors hover:text-zinc-800 focus:outline-none focus-visible:text-zinc-800"
              >
                <FiEdit2 className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-medium">{deviceDetailStrings.edit}</span>
              </button>

              <button
                type="button"
                onClick={onFeedConfirmOpen}
                disabled={isFeeding}
                aria-label={deviceDetailStrings.feedAriaLabel}
                aria-busy={isFeeding}
                className="-mt-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-4 ring-white transition-colors hover:bg-emerald-600 focus:outline-none focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {isFeeding ? (
                  <FiLoader className="h-6 w-6 animate-spin" aria-hidden="true" />
                ) : (
                  <LuPlay className="h-6 w-6" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('history')}
                className="flex flex-1 flex-col items-center gap-1 text-zinc-500 transition-colors hover:text-zinc-800 focus:outline-none focus-visible:text-zinc-800"
              >
                <LuHistory className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-medium">{deviceDetailStrings.history}</span>
              </button>
            </div>
          </nav>

          <DeviceEditModal
            isOpen={isEditOpen}
            onClose={onEditClose}
            device={device}
            onUpdated={() => {
              showToast(deviceDetailStrings.updateSuccess, {
                variant: 'success',
              });
              refetch();
            }}
          />

          <ConfirmDialog
            isOpen={isFeedConfirmOpen}
            onClose={() => {
              if (isFeeding) return;
              onFeedConfirmClose();
            }}
            onConfirm={handleConfirmFeed}
            title={commonStrings.feed.confirmTitle}
            description={commonStrings.feed.confirmDescription(displayName)}
            confirmLabel={commonStrings.feed.confirmLabel}
            isLoading={isFeeding}
            variant="primary"
          />
        </>
      )}
    </InternalLayout>
  );
}

export default DeviceDetailPage;
