import styled from 'styled-components';

export const SourceNote = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted || '#A0AEC0'};
  margin-bottom: 1rem;
  font-style: italic;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  
  @media(max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[50] || '#F7FAFC'};
  border-radius: 10px;
  padding: 1rem;
  border: 0.5px solid ${({ theme }) => theme.colors.border || '#E2E8F0'};
`;

export const StatLabel = styled.p`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.25rem;
`;

export const StatValue = styled.p<{ $color?: string }>`
  font-family: 'Inter', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ $color, theme }) => $color || theme.colors.primary[800] || '#0C2B5E'};
  margin: 0 0 0.125rem;
`;

export const StatNote = styled.p`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.text.muted || '#A0AEC0'};
  margin: 0;
`;

export const CardHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

export const CardDescription = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  margin-bottom: 0.75rem;
`;

export const ControlRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.625rem 0;
  border-bottom: 0.5px solid ${({ theme }) => theme.colors.border || '#F0F0F0'};
  font-size: 0.875rem;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const ControlLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
`;

export const ControlValue = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary[500] || '#1A56A0'};
  text-align: right;
  max-width: 55%;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.8125rem;
`;
