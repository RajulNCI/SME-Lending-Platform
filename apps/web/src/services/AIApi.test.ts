import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getQueue, submitApplication } from './AIApi';

// Mock the internal mockPythonApi calls since USE_REAL_API=false by default
vi.mock('./mockPythonApi', () => ({
  mockGetQueue: vi.fn().mockResolvedValue([
    { applicationId: 'APP-123', borrowerName: 'Acme Corp', status: 'review' }
  ]),
  mockSubmitApplication: vi.fn().mockResolvedValue({ status: 'received' })
}));

describe('AIApi Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submitApplication should submit application data successfully', async () => {
    const result = await submitApplication('APP-123', [{ name: 'doc1.pdf', size: 1024, type: 'pdf' }]);
    expect(result).toEqual({ status: 'received' });
  });

  it('getQueue should fetch the queue summary', async () => {
    const result = await getQueue();
    expect(result).toEqual([
      { applicationId: 'APP-123', borrowerName: 'Acme Corp', status: 'review' }
    ]);
  });
});
