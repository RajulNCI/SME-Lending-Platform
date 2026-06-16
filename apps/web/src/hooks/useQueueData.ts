import { useState, useEffect, useCallback } from 'react';
import { getQueue, submitDecision, getAssessment, type QueueApplicationSummary } from '../services/AIApi';

export function useQueueData() {
  const [apps, setApps] = useState<QueueApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQueue();
      
      // For each app in the queue, try to fetch its assessment data
      const enriched = await Promise.all(
        data.map(async (app) => {
          // If assessment data isn't already embedded, fetch it
          if (!app.assessment && app.applicationId) {
            try {
              const assessment = await getAssessment(app.applicationId);
              return {
                ...app,
                assessment,
                riskGrade: assessment.riskGrade || app.riskGrade,
                pd: assessment.pd || app.pd,
                dscr: assessment.dscr || app.dscr,
                recommendation: assessment.recommendedStatus || app.recommendation,
              };
            } catch {
              // Assessment not ready yet — that's fine
              return app;
            }
          }
          return app;
        })
      );
      
      setApps(enriched);
    } catch (err) {
      console.error('Failed to fetch queue', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleDecision = async (
    applicationId: string,
    decision: 'approved' | 'referred' | 'declined',
    rationale: string,
    _officerName: string
  ) => {
    try {
      await submitDecision({
        applicationId,
        decision: decision.toUpperCase() as 'APPROVED' | 'REFERRED' | 'DECLINED',
        notes: rationale,
      });
      await fetchQueue(); // Refresh queue after decision
      return true;
    } catch (err) {
      console.error('Decision failed', err);
      return false;
    }
  };

  return { apps, loading, handleDecision, refresh: fetchQueue };
}
