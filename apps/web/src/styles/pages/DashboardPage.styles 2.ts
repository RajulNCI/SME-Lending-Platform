import styled from 'styled-components';

export const SourceNote = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted || '#A0AEC0'};
  margin-bottom: 1rem;
  font-style: italic;
`;

export const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  
  @media(max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const DashboardCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[50] || '#F7FAFC'};
  border-radius: 10px;
  padding: 1rem;
  border: 0.5px solid ${({ theme }) => theme.colors.border || '#E2E8F0'};
`;

export const DashboardLabel = styled.p`
  font-size: 0.6875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.375rem;
`;

export const DashboardValue = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary[800] || '#0C2B5E'};
  margin: 0 0 0.25rem;
`;

export const EmptyStateText = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
`;
