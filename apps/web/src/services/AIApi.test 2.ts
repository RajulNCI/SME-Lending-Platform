import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { analyzeApplication, listQueue, getQueueDetails } from './AIApi';

vi.mock('axios');

describe('AIApi Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('analyzeApplication should post application data successfully', async () => {
    const mockData = { id: 'test-id', status: 'processing' };
    (axios.post as any).mockResolvedValueOnce({ data: mockData });

    const payload = {
      applicationId: 'APP-123',
      borrower: 'Acme Corp',
      requestedAmount: 50000,
      revenue: 1000000,
      ebitda: 200000,
      dscr: 1.5,
    };

    const result = await analyzeApplication(payload);

    expect(axios.post).toHaveBeenCalledWith('/ai-api/api/v1/decisions/analyze', payload);
    expect(result).toEqual(mockData);
  });

  it('listQueue should fetch the HITL queue successfully', async () => {
    const mockData = [{ applicationId: 'APP-123', borrower: 'Acme Corp' }];
    (axios.get as any).mockResolvedValueOnce({ data: mockData });

    const result = await listQueue();

    expect(axios.get).toHaveBeenCalledWith('/ai-api/api/v1/hitl/queue');
    expect(result).toEqual(mockData);
  });

  it('getQueueDetails should fetch details for a specific application', async () => {
    const mockData = { applicationId: 'APP-123', borrower: 'Acme Corp', status: 'review' };
    (axios.get as any).mockResolvedValueOnce({ data: mockData });

    const result = await getQueueDetails('APP-123');

    expect(axios.get).toHaveBeenCalledWith('/ai-api/api/v1/hitl/queue/APP-123');
    expect(result).toEqual(mockData);
  });
});
