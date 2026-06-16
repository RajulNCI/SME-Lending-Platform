import { useState, useEffect, useCallback, useRef } from 'react';
import { getProgress } from '../services/AIApi';

export function useApplicationPolling(applicationId: string | null, totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPolling = useCallback(async (idOverride?: string) => {
    const idToUse = idOverride || applicationId;
    if (!idToUse) return;
    
    setCurrentStep(0);
    setIsComplete(false);
    setError(null);

    const poll = async () => {
      try {
        const progData = await getProgress(idToUse);
        setCurrentStep(Math.min(progData.step, totalSteps));
        
        if (progData.completed) {
          setIsComplete(true);
          setDecision(progData.decision || null);
        } else {
          // Poll every 3 seconds (real API, no need to advance steps)
          pollTimer.current = setTimeout(poll, 3000);
        }
      } catch (err) {
        console.error("Polling error:", err);
        setError("Failed to fetch progress.");
        // Retry after a longer delay on error
        pollTimer.current = setTimeout(poll, 5000);
      }
    };

    poll();
  }, [applicationId, totalSteps]);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  return { currentStep, setCurrentStep, isComplete, error, startPolling, setIsComplete, decision };
}
