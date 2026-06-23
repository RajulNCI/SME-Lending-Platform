export interface Form {
  borrower: string;
  sector: string;
  requestedAmount: string;
  revenue: string;
  ebitda: string;
  dscr: string;
  accountingPeriod: string;
  documentType: string;
  loanPurpose: string;
  notes: string;
  consentData: boolean;
  consentCCR: boolean;
  consentAI: boolean;
}

export type Prefilled = Partial<Record<keyof Form, boolean>>;
export type Errors = Partial<Record<keyof Form, string>>;

export const BLANK_FORM: Form = {
  borrower: '',
  sector: '',
  requestedAmount: '',
  revenue: '',
  ebitda: '',
  dscr: '',
  accountingPeriod: '',
  documentType: '',
  loanPurpose: '',
  notes: '',
  consentData: false,
  consentCCR: false,
  consentAI: false,
};
