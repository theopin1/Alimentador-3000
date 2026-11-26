import { useCallback, useState } from 'react';
import { feedingService } from '../services/feeding.service';
import type { ApiErrorPayload } from '../services/api';
import type { FeedingEvent, ID, ManualFeedPayload } from '../services/types';
import { commonStrings } from '../strings/pt-br';

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'message' in value
  );
}

function extractMessage(error: unknown): string {
  return isApiErrorPayload(error) ? error.message : commonStrings.feed.error;
}

export interface UseManualFeedResult {
  feed: (
    deviceId: ID,
    payload?: ManualFeedPayload,
  ) => Promise<FeedingEvent>;
  isFeeding: boolean;
}

export function useManualFeed(): UseManualFeedResult {
  const [isFeeding, setIsFeeding] = useState(false);

  const feed = useCallback(
    async (deviceId: ID, payload: ManualFeedPayload = {}) => {
      setIsFeeding(true);
      try {
        return await feedingService.triggerManualFeed(deviceId, payload);
      } catch (error) {
        throw new Error(extractMessage(error));
      } finally {
        setIsFeeding(false);
      }
    },
    [],
  );

  return { feed, isFeeding };
}

export default useManualFeed;
