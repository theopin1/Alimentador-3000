import type { DayOfWeek } from '../../../services/types';
import { deviceDetailStrings } from '../../../strings/pt-br';

interface DayOption {
  value: DayOfWeek;
  short: string;
  long: string;
}

const DAY_DISPLAY_ORDER: DayOfWeek[] = [7, 1, 2, 3, 4, 5, 6];

export const DAY_OPTIONS: DayOption[] = DAY_DISPLAY_ORDER.map((value) => ({
  value,
  short: deviceDetailStrings.days.short[value],
  long: deviceDetailStrings.days.long[value],
}));

export function formatTime(time: string): string {
  if (!time) return deviceDetailStrings.days.emptyTime;
  const [hours, minutes] = time.split(':');
  if (hours === undefined || minutes === undefined) return time;
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

export function formatDaysSummary(days: DayOfWeek[] | null): string {
  if (!days || days.length === 0 || days.length === 7) {
    return deviceDetailStrings.days.everyDay;
  }

  const weekdays: DayOfWeek[] = [1, 2, 3, 4, 5];
  const weekend: DayOfWeek[] = [6, 7];
  const sorted = [...days].sort((a, b) => a - b);

  const isWeekdays =
    sorted.length === weekdays.length &&
    weekdays.every((day) => sorted.includes(day));
  if (isWeekdays) return deviceDetailStrings.days.weekdays;

  const isWeekend =
    sorted.length === weekend.length &&
    weekend.every((day) => sorted.includes(day));
  if (isWeekend) return deviceDetailStrings.days.weekend;

  return DAY_OPTIONS.filter((option) => days.includes(option.value))
    .map((option) => option.short)
    .join(', ');
}
