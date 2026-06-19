export interface ShapValue {
  feature: string;
  value: number;
  direction: 'positive' | 'negative';
}

export interface ComplianceCheck {
  status: 'pass' | 'warn' | 'fail';
  name: string;
  detail: string;
  time: string;
}

export interface Transaction {
  date: string;
  desc: string;
  category: string;
  amount: string;
}

export interface Counterfactual {
  condition: string;
  outcome: string;
  dir: 'positive' | 'negative';
}

export interface StressTest {
  rateshockDscr: number;
  rateshockAff: number;
  recessionPD: number;
}

export interface FairnessMetrics {
  disparateImpact: number;
  equalOpportunity: number;
}

export interface AppDetail {
  id: string;
  company: string;
  crn?: string;
  sector: string;
  amount: string;
  loanType: string;
  status: string;
  decisionOfficer?: string;

  // AI assessment outputs
  pd: number;
  riskGrade: string;
  dscr: number;
  apr: number;
  affordability: number;
  lgd: number;
  ead: number;

  // Revenue (formatted strings from open banking / IDP)
  revenue?: string;
  revenueActual?: string;
  cashflow?: string;

  // IFRS 9
  ecl12m: number;
  eclStage: 1 | 2 | 3;
  eclLifetime?: number;

  // PD confidence interval
  pdLow?: number;
  pdHigh?: number;

  // Open banking chart (12 monthly values)
  bars?: number[];
  transactions?: Transaction[];

  // Revenue reconciliation
  discrepancy?: boolean;
  discrepancyDetail?: string;

  // Explainability
  shapValues?: ShapValue[];
  counterfactuals?: Counterfactual[];
  narrative?: string;

  // Fairness & stress
  fairnessMetrics?: FairnessMetrics;
  stressTest?: StressTest;

  // Compliance
  checks?: ComplianceCheck[];

  // HITL flag
  hitl?: boolean;
  hitlReason?: string;
}

// ── Shared formatters ───────────────────────────────────────────────────────
export const fmt = (v: unknown, pre = '€'): string => {
  if (v == null) return '—';
  return `${pre}${Number(v).toLocaleString()}`;
};

export const fmtPD = (v: unknown): string => {
  if (v == null) return '—';
  return `${(Number(v) * 100).toFixed(1)}%`;
};

export const pct = (v: unknown): string => {
  if (v == null) return '—';
  return `${(Number(v) * 100).toFixed(1)}%`;
};

export const MONTHS = ['M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D', 'J', 'F'];
