import { useState, useEffect, useCallback, useRef } from 'react';
import { getProgress, advanceStep } from '../services/AIApi';

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
          // If mock mode, manually advance step on the mock backend
          await advanceStep(idToUse, progData.step + 1);
          pollTimer.current = setTimeout(poll, 1000);
        }
      } catch (err) {
        console.error("Polling error:", err);
        setError("Failed to fetch progress.");
        // Stop polling on error for now
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
