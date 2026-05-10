import styled from 'styled-components';

export const RiskGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
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

export const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 0.5px solid ${({ theme }) => theme.colors.border || '#F0F0F0'};
  font-size: 0.875rem;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
`;

export const MetricValueGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

export const MetricValue = styled.span<{ $error?: boolean }>`
  font-weight: 600;
  color: ${({ $error, theme }) => $error ? (theme.colors.error[600] || '#A32D2D') : (theme.colors.primary[800] || '#0C2B5E')};
  font-family: 'IBM Plex Mono', monospace;
`;
