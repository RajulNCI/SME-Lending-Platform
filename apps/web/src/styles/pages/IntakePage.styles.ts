import styled from 'styled-components';

export const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const StepCard = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: ${({ theme }) => theme.colors.gray[50] || '#F7FAFC'};
  border-radius: 12px;
  border: 0.5px solid ${({ theme }) => theme.colors.border || '#E2E8F0'};
  align-items: flex-start;
  
  @media(max-width: 600px) {
    flex-direction: column;
  }
`;

export const StepNum = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

export const StepBody = styled.div`
  flex: 1;
`;

export const StepLabel = styled.p`
  font-size: 0.6875rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary[600] || '#1A56A0'};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 0.25rem;
`;

export const StepTitle = styled.p`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary[800] || '#0C2B5E'};
  margin: 0 0 0.375rem;
`;

export const StepDesc = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  margin: 0 0 0.625rem;
  line-height: 1.6;
`;

export const TagList = styled.div`
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
`;

export const ItemTag = styled.span`
  font-size: 0.6875rem;
  padding: 2px 8px;
  background: ${({ theme }) => theme.colors.gray[100] || '#EDF2F7'};
  color: ${({ theme }) => theme.colors.text.muted || '#4A5568'};
  border-radius: 4px;
  font-family: 'IBM Plex Mono', monospace;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const HeaderDesc = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  margin: 0;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  
  @media(max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[50] || '#F7FAFC'};
  border-radius: 10px;
  padding: 0.875rem 1rem;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $color, theme }) => $color || theme.colors.primary[800] || '#0C2B5E'};
  margin: 0;
`;

export const TitleDesc = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.muted || '#718096'};
  margin: 0.25rem 0 0;
`;
