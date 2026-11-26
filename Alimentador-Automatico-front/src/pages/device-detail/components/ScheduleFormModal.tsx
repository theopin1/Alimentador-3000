import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../../../components/ui';
import { Button } from '../../../components/ui';
import type {
  DayOfWeek,
  FeedingSchedule,
  StoreSchedulePayload,
} from '../../../services/types';
import { DAY_OPTIONS } from './scheduleUtils';
import { commonStrings, deviceDetailStrings } from '../../../strings/pt-br';

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: StoreSchedulePayload) => Promise<void>;
  schedule?: FeedingSchedule | null;
}

function normalizeTime(time: string | undefined): string {
  if (!time) return '08:00';
  const [hours, minutes] = time.split(':');
  if (hours === undefined || minutes === undefined) return '08:00';
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

export function ScheduleFormModal({
  isOpen,
  onClose,
  onSubmit,
  schedule,
}: ScheduleFormModalProps) {
  const isEditing = Boolean(schedule);

  const [time, setTime] = useState('08:00');
  const [portion, setPortion] = useState('20');
  const [days, setDays] = useState<DayOfWeek[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTime(normalizeTime(schedule?.scheduled_time));
    setPortion(
      schedule?.portion_grams ? String(schedule.portion_grams) : '20',
    );
    setDays(schedule?.days_of_week ?? []);
    setIsActive(schedule?.is_active ?? true);
    setError(null);
    setIsSubmitting(false);
  }, [isOpen, schedule]);

  function toggleDay(day: DayOfWeek) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const portionValue = Number(portion);
    if (!time) {
      setError(deviceDetailStrings.scheduleForm.timeRequired);
      return;
    }
    if (!Number.isFinite(portionValue) || portionValue <= 0) {
      setError(deviceDetailStrings.scheduleForm.invalidPortion);
      return;
    }

    const payload: StoreSchedulePayload = {
      scheduled_time: time.length === 5 ? `${time}` : time,
      portion_grams: portionValue,
      is_active: isActive,
      ...(days.length > 0 ? { days_of_week: [...days].sort((a, b) => a - b) } : {}),
    };

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : deviceDetailStrings.scheduleForm.saveError,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? deviceDetailStrings.scheduleForm.editTitle
          : deviceDetailStrings.scheduleForm.createTitle
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex justify-center rounded-xl bg-zinc-100 py-5">
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            aria-label={deviceDetailStrings.scheduleForm.timeAriaLabel}
            className="bg-transparent text-center text-5xl font-light tracking-tight text-zinc-900 focus:outline-none"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-zinc-800">
            {deviceDetailStrings.scheduleForm.repeat}
          </p>
          <div className="flex flex-wrap justify-between gap-1.5">
            {DAY_OPTIONS.map((option) => {
              const selected = days.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleDay(option.value)}
                  aria-pressed={selected}
                  aria-label={option.long}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                    selected
                      ? 'bg-zinc-800 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {option.short}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            {deviceDetailStrings.scheduleForm.noDaysHint}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="schedule-portion"
            className="text-sm font-semibold text-zinc-800"
          >
            {deviceDetailStrings.scheduleForm.portionLabel}
          </label>
          <input
            id="schedule-portion"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={portion}
            onChange={(event) => setPortion(event.target.value)}
            className="w-full rounded-md border border-transparent bg-zinc-200 px-3 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
        </div>

        <label className="flex items-center justify-between gap-3 rounded-md bg-zinc-50 px-3 py-2.5 ring-1 ring-zinc-100">
          <span className="text-sm font-medium text-zinc-700">
            {deviceDetailStrings.scheduleForm.activeLabel}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
              isActive ? 'bg-emerald-500' : 'bg-zinc-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                isActive ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-1 flex gap-3">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="flex-1"
          >
            {isEditing
              ? deviceDetailStrings.scheduleForm.submitEdit
              : deviceDetailStrings.scheduleForm.submitCreate}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {commonStrings.cancel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ScheduleFormModal;
