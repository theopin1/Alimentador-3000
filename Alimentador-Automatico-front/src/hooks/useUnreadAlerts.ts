import { useEffect, useState } from 'react';
import { alertService } from '../services/alert.service';

export function useUnreadAlerts() {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const page = await alertService.list(1);
        if (cancelled) return;
        setHasUnread(page.data.some((alert) => !alert.is_read));
      } catch {
        if (cancelled) return;
        setHasUnread(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { hasUnread };
}

export default useUnreadAlerts;
