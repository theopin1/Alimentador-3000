import { FiDroplet, FiBattery, FiThermometer, FiLoader } from 'react-icons/fi';
import { LuPlay } from 'react-icons/lu';
import { useManualFeed } from '../../../hooks/useManualFeed';
import { useToast } from '../../../hooks/useToast';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { ConfirmDialog } from '../../../components/ui';
import type { Device, TelemetryReading } from '../../../services/types';
import { commonStrings, devicesStrings } from '../../../strings/pt-br';

interface DeviceCardProps {
  device: Device;
  onSelect?: (deviceId: Device['id']) => void;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'string' ? Number(value) : value;
  return Number.isNaN(parsed) ? null : parsed;
}

function formatReadAt(reading: TelemetryReading | null | undefined): string {
  if (!reading?.read_at) return devicesStrings.card.noReadings;
  const date = new Date(reading.read_at);
  if (Number.isNaN(date.getTime())) return devicesStrings.card.noReadings;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface CapacityBarProps {
  label: string;
  percent: number | null;
}

function CapacityBar({ label, percent }: CapacityBarProps) {
  const value = percent ?? 0;
  const barColor =
    value <= 20
      ? 'bg-red-500'
      : value <= 40
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
        <span>{label}</span>
        <span className="font-medium text-zinc-700">
          {percent === null ? commonStrings.emptyValue : `${percent} %`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

interface MetricProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function Metric({ icon, value, label }: MetricProps) {
  return (
    <div className="flex flex-col items-start gap-1 rounded-lg bg-zinc-50 px-2 py-2 ring-1 ring-zinc-100">
      <span className="text-[11px] text-zinc-400">{label}</span>
      
      <div className="flex flex-row items-center gap-1">
        <span className="text-zinc-500">{icon}</span>
        <span className="text-sm font-semibold text-zinc-900 min-w-10">{value}</span>
       
      </div>
    </div>
  );
}

export function DeviceCard({ device, onSelect }: DeviceCardProps) {
  const { feed, isFeeding } = useManualFeed();
  const { showToast } = useToast();
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();

  const displayName =
    device.name?.trim() || commonStrings.deviceFallbackName(device.id);
  const telemetry = device.latest_telemetry;

  function handleSelect() {
    onSelect?.(device.id);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect();
    }
  }

  function handleFeedClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onConfirmOpen();
  }

  async function handleConfirmFeed() {
    try {
      await feed(device.id);
      showToast(commonStrings.feed.success(displayName), {
        variant: 'success',
      });
      onConfirmClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : commonStrings.feed.error;
      showToast(message, { variant: 'error' });
    }
  }

  const reservoirPercent = toNumber(telemetry?.reservoir_level_percentage);

  const humidity = toNumber(telemetry?.humidity);
  const battery = toNumber(telemetry?.battery_voltage);
  const temperature = toNumber(telemetry?.temperature);

  return (
    <>
    <article
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? handleSelect : undefined}
      onKeyDown={onSelect ? handleKeyDown : undefined}
      aria-label={onSelect ? devicesStrings.card.openAriaLabel(displayName) : undefined}
      className={`rounded-xl border border-zinc-200 bg-white p-4 shadow-sm ${
        onSelect
          ? 'cursor-pointer transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2'
          : ''
      }`}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-zinc-900">
            {displayName}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-400">
            {devicesStrings.card.lastReading(formatReadAt(telemetry))}
          </p>
        </div>
        <button
          type="button"
          onClick={handleFeedClick}
          disabled={isFeeding}
          aria-label={devicesStrings.card.feedAriaLabel}
          aria-busy={isFeeding}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition-colors hover:bg-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
        >
          {isFeeding ? (
            <FiLoader className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LuPlay className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </header>

      <div className="mt-4 flex flex-col gap-3">
        <CapacityBar label={devicesStrings.card.reservoir} percent={reservoirPercent} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric
          icon={<FiDroplet className="h-4 w-4" aria-hidden="true" />}
          value={humidity === null ? commonStrings.emptyValue : `${Math.round(humidity)} %`}
          label={devicesStrings.card.humidity}
        />
        <Metric
          icon={<FiThermometer className="h-4 w-4" aria-hidden="true" />}
          value={temperature === null ? commonStrings.emptyValue : `${Math.round(temperature)} °C`}
          label={devicesStrings.card.temperature}
        />        
        <Metric
          icon={<FiBattery className="h-4 w-4" aria-hidden="true" />}
          value={battery === null ? commonStrings.emptyValue : `${battery.toFixed(1)} V`}
          label={devicesStrings.card.battery}
        />
      </div>
    </article>

    <ConfirmDialog
      isOpen={isConfirmOpen}
      onClose={() => {
        if (isFeeding) return;
        onConfirmClose();
      }}
      onConfirm={handleConfirmFeed}
      title={commonStrings.feed.confirmTitle}
      description={commonStrings.feed.confirmDescription(displayName)}
      confirmLabel={commonStrings.feed.confirmLabel}
      isLoading={isFeeding}
      variant="primary"
    />
    </>
  );
}

export default DeviceCard;
