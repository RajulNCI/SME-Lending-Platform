import { useState, useEffect, useCallback } from 'react';
import { getQueue, submitDecision, type QueueApplicationSummary } from '../services/AIApi';

export function useQueueData() {
  const [apps, setApps] = useState<QueueApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQueue();
      setApps(data);
    } catch (err) {
      console.error('Failed to fetch queue', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleDecision = async (applicationId: string, decision: 'approved' | 'referred' | 'declined', rationale: string, officerName: string) => {
    try {
      await submitDecision({ applicationId, decision, rationale, officerName });
      await fetchQueue(); // Refresh queue after decision
      return true;
    } catch (err) {
      console.error('Decision failed', err);
      return false;
    }
  };

  return { apps, loading, handleDecision, refresh: fetchQueue };
}
