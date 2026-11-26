import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { useSchedules } from '../../../hooks/useSchedules';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { useToast } from '../../../hooks/useToast';
import { ConfirmDialog } from '../../../components/ui';
import type {
  FeedingSchedule,
  ID,
  StoreSchedulePayload,
} from '../../../services/types';
import { ScheduleCard } from './ScheduleCard';
import { ScheduleFormModal } from './ScheduleFormModal';
import { formatTime } from './scheduleUtils';
import { commonStrings, deviceDetailStrings } from '../../../strings/pt-br';

interface SchedulesSectionProps {
  deviceId: ID;
}

export function SchedulesSection({ deviceId }: SchedulesSectionProps) {
  const { schedules, isLoading, error, refetch, create, update, remove } =
    useSchedules(deviceId);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { showToast } = useToast();

  const [editing, setEditing] = useState<FeedingSchedule | null>(null);
  const [deletingId, setDeletingId] = useState<ID | null>(null);
  const [scheduleToDelete, setScheduleToDelete] =
    useState<FeedingSchedule | null>(null);

  function handleCreate() {
    setEditing(null);
    onOpen();
  }

  function handleEdit(schedule: FeedingSchedule) {
    setEditing(schedule);
    onOpen();
  }

  async function handleSubmit(payload: StoreSchedulePayload) {
    if (editing) {
      await update(editing.id, payload);
      showToast(deviceDetailStrings.schedules.updateSuccess, {
        variant: 'success',
      });
    } else {
      await create(payload);
      showToast(deviceDetailStrings.schedules.createSuccess, {
        variant: 'success',
      });
    }
    onClose();
    setEditing(null);
  }

  function handleDelete(schedule: FeedingSchedule) {
    setScheduleToDelete(schedule);
  }

  async function handleConfirmDelete() {
    if (!scheduleToDelete) return;

    setDeletingId(scheduleToDelete.id);
    try {
      await remove(scheduleToDelete.id);
      showToast(deviceDetailStrings.schedules.deleteSuccess, {
        variant: 'success',
      });
      setScheduleToDelete(null);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : deviceDetailStrings.schedules.deleteError;
      showToast(message, { variant: 'error' });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-xl bg-zinc-100/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-zinc-900">
          {deviceDetailStrings.schedules.title}
        </h2>
        <button
          type="button"
          onClick={handleCreate}
          aria-label={deviceDetailStrings.schedules.addAriaLabel}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-white transition-colors hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
        >
          <FiPlus className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {isLoading && (
          <p className="py-4 text-center text-sm text-zinc-500">
            {deviceDetailStrings.schedules.loading}
          </p>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center gap-2 rounded-md bg-red-50 px-3 py-4 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-900"
            >
              {commonStrings.retry}
            </button>
          </div>
        )}

        {!isLoading && !error && schedules.length === 0 && (
          <p className="rounded-md bg-white px-3 py-6 text-center text-sm text-zinc-500 ring-1 ring-zinc-200">
            {deviceDetailStrings.schedules.empty}
          </p>
        )}

        {!isLoading &&
          !error &&
          schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deletingId === schedule.id}
            />
          ))}
      </div>

      <ScheduleFormModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        schedule={editing}
      />

      <ConfirmDialog
        isOpen={scheduleToDelete !== null}
        onClose={() => {
          if (deletingId !== null) return;
          setScheduleToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={deviceDetailStrings.schedules.deleteConfirmTitle}
        description={
          scheduleToDelete
            ? deviceDetailStrings.schedules.deleteConfirmDescription(
                formatTime(scheduleToDelete.scheduled_time),
              )
            : undefined
        }
        confirmLabel={deviceDetailStrings.schedules.deleteConfirmLabel}
        isLoading={deletingId !== null}
        variant="danger"
      />
    </section>
  );
}

export default SchedulesSection;
