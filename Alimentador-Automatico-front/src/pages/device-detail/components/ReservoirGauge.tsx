import { commonStrings, deviceDetailStrings } from '../../../strings/pt-br';

interface ReservoirGaugeProps {
  percent: number | null;
}

function colorForPercent(value: number): string {
  if (value <= 20) return '#ef4444';
  if (value <= 40) return '#f59e0b';
  return '#10b981';
}

export function ReservoirGauge({ percent }: ReservoirGaugeProps) {
  const hasValue = percent !== null && !Number.isNaN(percent);
  const clamped = hasValue ? Math.min(100, Math.max(0, percent)) : 0;
  const strokeColor = colorForPercent(clamped);

  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <svg
        viewBox="0 0 200 110"
        className="w-full"
        role="img"
        aria-label={deviceDetailStrings.gauge.ariaLabel(
          hasValue
            ? `${Math.round(clamped)}%`
            : deviceDetailStrings.gauge.noReading,
        )}
      >
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="var(--color-zinc-200)"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke={strokeColor}
          strokeWidth={14}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${clamped} 100`}
          className="transition-all duration-500 ease-out"
        />
      </svg>

      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className="text-4xl font-semibold text-zinc-800">
          {hasValue ? `${Math.round(clamped)} %` : commonStrings.emptyValue}
        </span>
        <span className="mt-1 text-xs text-zinc-400">
          {deviceDetailStrings.gauge.caption}
        </span>
      </div>
    </div>
  );
}

export default ReservoirGauge;
