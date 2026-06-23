import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the HTTP client — AIApi delegates all network calls to apiClient.
vi.mock('./apiClient', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiPostForm: vi.fn(),
}));

import { getQueue, getProgress } from './AIApi';
import { apiGet } from './apiClient';

describe('AIApi Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getQueue maps raw application records to queue summaries', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce([
      {
        id: 'APP-123',
        company_name: 'Acme Corp',
        sector: 'Technology',
        loan_amount: 50000,
        loan_purpose: 'WORKING_CAPITAL',
        status: 'hitl_queue',
        risk_grade: 'A',
        pd: 0.0048,
        dscr: 3.58,
      },
    ]);

    const result = await getQueue();

    expect(apiGet).toHaveBeenCalledWith('/api/v1/applications');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'APP-123',
      company: 'Acme Corp',
      sector: 'Technology',
      status: 'hitl_queue',
      hitl: true,
      riskGrade: 'A',
      pd: 0.0048,
      dscr: 3.58,
    });
  });

  it('getProgress maps the processing-job step to a UI step', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce({
      status: 'running',
      current_step: 'PD_AI_MODEL',
    });

    const result = await getProgress('APP-123');

    expect(result).toEqual({ step: 4, total_steps: 6, completed: false });
  });
});
