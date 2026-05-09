import styled from 'styled-components';

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const HeaderSubtitle = styled.p`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0;
`;

export const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 2.5rem 1rem;
`;

export const EmptyStateIcon = styled.p`
  font-size: 2rem;
  margin: 0 0 0.75rem;
`;

export const EmptyStateTitle = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary[800]};
  margin: 0 0 0.5rem;
`;

export const EmptyStateDescription = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0 0 1.25rem;
`;

export const RightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`;

export const RightItem = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem;
  background: ${({ theme }) => theme.colors.primary[50]};
  border-radius: 8px;
`;

export const RightIcon = styled.span`
  font-size: 1.25rem;
`;

export const RightTitle = styled.p`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary[800]};
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
`;

export const RightDescription = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0;
`;
