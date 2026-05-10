import styled from 'styled-components';

export const DynamicNote = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: 1rem;
  font-style: italic;
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

export const BadgesContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const UserRow = styled.div<{ $isLast: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.5rem;
  border-bottom: ${({ $isLast, theme }) => ($isLast ? 'none' : `0.5px solid ${theme.colors.border}`)};
  font-size: 0.875rem;
`;

export const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary[50]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.primary[800]};
`;

export const UserName = styled.p`
  margin: 0;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const UserUsername = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-family: 'IBM Plex Mono', monospace;
`;

export const UserBadgesContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;
