import type { Alert, AlertSeverity, ISODate } from '../../../services/types';
import { commonStrings, alertsStrings } from '../../../strings/pt-br';

export function formatAlertDateTime(date: ISODate | null): string {
  if (!date) return commonStrings.emptyValue;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return commonStrings.emptyValue;
  return parsed.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface SeverityInfo {
  label: string;
  dotClassName: string;
  textClassName: string;
}

export function getSeverityInfo(severity: AlertSeverity): SeverityInfo {
  switch (severity) {
    case 'critical':
      return {
        label: alertsStrings.severity.critical,
        dotClassName: 'bg-red-600',
        textClassName: 'text-red-700',
      };
    case 'high':
      return {
        label: alertsStrings.severity.high,
        dotClassName: 'bg-orange-500',
        textClassName: 'text-orange-600',
      };
    case 'medium':
      return {
        label: alertsStrings.severity.medium,
        dotClassName: 'bg-amber-400',
        textClassName: 'text-amber-600',
      };
    case 'low':
      return {
        label: alertsStrings.severity.low,
        dotClassName: 'bg-sky-400',
        textClassName: 'text-sky-600',
      };
    default:
      return {
        label: String(severity),
        dotClassName: 'bg-zinc-400',
        textClassName: 'text-zinc-600',
      };
  }
}

export function formatAlertType(type: string): string {
  if (alertsStrings.type[type]) return alertsStrings.type[type];
  return type
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function isResolved(alert: Alert): boolean {
  return alert.resolved_at !== null;
}

export function getDeviceLabel(alert: Alert): string {
  const name = alert.device?.name?.trim();
  if (name) return name;
  if (alert.device?.serial_code) return alert.device.serial_code;
  return commonStrings.deviceFallbackName(alert.device_id);
}
