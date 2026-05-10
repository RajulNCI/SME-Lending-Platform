import styled from 'styled-components';

export const MrmGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media(max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const SourceNote = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted || '#A0AEC0'};
  margin-bottom: 1rem;
  font-style: italic;
`;

export const InventoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  align-items: center;
`;

export const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 0.5px solid ${({ theme }) => theme.colors.border || '#F0F0F0'};
  font-size: 0.8125rem;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const MetricKey = styled.span`
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
`;

export const MetricValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary[800] || '#0C2B5E'};
  font-family: 'IBM Plex Mono', monospace;
`;

export const DriftStatus = styled.div`
  padding: 1rem 0;
  text-align: center;
`;

export const DriftIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 0.5rem;
  line-height: 1;
  color: ${({ theme }) => theme.colors.success[600] || '#0F6E56'};
`;

export const DriftTitle = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.success[600] || '#0F6E56'};
  margin: 0 0 0.25rem;
`;

export const DriftDesc = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  margin: 0;
`;

export const TriggerLabel = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  margin-bottom: 0.5rem;
`;

export const TriggerRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.375rem 0;
  font-size: 0.8125rem;
`;

export const TriggerKey = styled.span`
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
`;

export const TriggerValue = styled.span`
  color: ${({ theme }) => theme.colors.primary[800] || '#0C2B5E'};
  font-family: 'IBM Plex Mono', monospace;
`;
