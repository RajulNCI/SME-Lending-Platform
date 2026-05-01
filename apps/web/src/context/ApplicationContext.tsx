/**
 * context/ApplicationContext.tsx
 * Shared application state between borrower and credit officer views.
 * Persists to sessionStorage so state survives page refreshes during the demo.
 *
 * When Nathan's AI API is ready:
 *   - Replace mock assessment injection with real API call in submitApplication()
 *   - Replace sessionStorage with proper backend calls
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  Application,
  ApplicationContextValue,
  ApplicationStatus,
  OfficerDecision,
  LoanType,
  UploadedDocument,
} from '../types/application';
import { generateAppId, formatAmount, makeAuditEvent } from '../types/application';
const MOCK_APPLICATIONS: Application[] = [];

// ── Context ───────────────────────────────────────────────────────────────────
const ApplicationContext = createContext<ApplicationContextValue | null>(null);

const STORAGE_KEY = 'finpal_applications_v1';

// ── Load / save helpers ───────────────────────────────────────────────────────
const loadFromStorage = (): Application[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Application[];
  } catch {
    // ignore
  }
  return MOCK_APPLICATIONS; // first load — seed with mock data
};

const saveToStorage = (apps: Application[]) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch {
    // ignore — storage full or unavailable
  }
};

// ── Provider ──────────────────────────────────────────────────────────────────
export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>(loadFromStorage);

  // Persist on every change
  useEffect(() => {
    saveToStorage(applications);
  }, [applications]);

  // ── Borrower: submit a new application ────────────────────────────────────
  // Creates the application record immediately.
  // assessment is null until AI steps complete (Nathan's API will fill this).
  const submitApplication = useCallback(
    (
      company: string,
      sector: string,
      loanType: LoanType,
      requestedAmount: number,
      documents: UploadedDocument[]
    ): Application => {
      const id = generateAppId();
      const now = new Date().toISOString();

      const app: Application = {
        id,
        createdAt: now,
        company,
        sector,
        loanType,
        requestedAmount,
        amount: formatAmount(requestedAmount),
        crn: `CRN ${Math.floor(Math.random() * 900000) + 100000}`,
        documents,
        status: 'submitted',
        currentPipelineStep: -1,
        hitl: false,
        officerDecision: null,
        officerRationale: null,
        officerName: null,
        decidedAt: null,
        assessment: null, // ← Nathan's API fills this
        auditLog: [
          makeAuditEvent('Application submitted', `${documents.length} document(s) uploaded`),
        ],
      };

      setApplications((prev) => [app, ...prev]);
      return app;
    },
    []
  );

  // ── Borrower: update which pipeline step is active ────────────────────────
  const updatePipelineStep = useCallback((id: string, step: number) => {
    const stepLabels = [
      'Application Intake received',
      'IDP / OCR extraction running',
      'Rules Engine assessment running',
      'OECB CCR check running',
    ];
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          currentPipelineStep: step,
          status: 'processing' as ApplicationStatus,
          auditLog: [
            ...a.auditLog,
            makeAuditEvent(`Step ${step + 1} started`, stepLabels[step] ?? `Step ${step + 1}`),
          ],
        };
      })
    );
  }, []);

  // ── Borrower: steps 1–4 done, hand off to officer ─────────────────────────
  const setWaitingForOfficer = useCallback((id: string) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          status: 'waiting_officer' as ApplicationStatus,
          currentPipelineStep: 4,
          auditLog: [
            ...a.auditLog,
            makeAuditEvent(
              'Assessment complete — awaiting Credit Officer',
              'Steps 1–4 complete. Maker-Checker gate active.'
            ),
          ],
        };
      })
    );
  }, []);

  // ── Officer: submit a decision ────────────────────────────────────────────
  // Updates the application — borrower's ProgressTracker reacts via context.
  const submitDecision = useCallback(
    (id: string, decision: OfficerDecision, rationale: string, officerName: string) => {
      const now = new Date().toISOString();
      setApplications((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          return {
            ...a,
            status: 'decided' as ApplicationStatus,
            currentPipelineStep: decision === 'approved' ? 5 : 4,
            officerDecision: decision,
            officerRationale: rationale,
            officerName,
            decidedAt: now,
            auditLog: [
              ...a.auditLog,
              makeAuditEvent(
                `Decision: ${decision.toUpperCase()}`,
                `Officer: ${officerName} · Rationale logged · EU AI Act Art.12`
              ),
            ],
          };
        })
      );
    },
    []
  );

  // ── Getters ───────────────────────────────────────────────────────────────
  const getApplication = useCallback(
    (id: string) => applications.find((a) => a.id === id),
    [applications]
  );

  const getPendingApplications = useCallback(
    () => applications.filter((a) => a.status !== 'decided'),
    [applications]
  );

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        submitApplication,
        updatePipelineStep,
        setWaitingForOfficer,
        submitDecision,
        getApplication,
        getPendingApplications,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useApplications = (): ApplicationContextValue => {
  const ctx = useContext(ApplicationContext);
  if (!ctx) throw new Error('useApplications must be used inside <ApplicationProvider>');
  return ctx;
};
