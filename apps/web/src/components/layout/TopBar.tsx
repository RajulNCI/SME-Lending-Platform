import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 1.5rem;
  background: #fff;
  border-bottom: 0.5px solid #e2e8f0;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
  @media (max-width: 767px) {
    padding: 0 1rem;
  }
`;
const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
const MobileLogo = styled.div`
  display: none;
  align-items: center;
  gap: 0.5rem;
  @media (max-width: 767px) {
    display: flex;
  }
`;
const PageTitle = styled.h1`
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0c2b5e;
  margin: 0;
`;
const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TopBarUser = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-left: 1rem;
  border-left: 1px solid #e2e8f0;
`;

const UserDetails = styled.div`
  text-align: right;
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #0c2b5e;
`;

const UserRoleText = styled.div`
  font-size: 10px;
  color: #64748b;
  font-family: 'IBM Plex Mono', monospace;
`;

const AvatarLg = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #0c2b5e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`;

interface TopBarProps {
  title: string;
  notifCount?: number;
  actions?: React.ReactNode;
}

const TopBar: React.FC<TopBarProps> = ({ title, actions }) => {
  const { user, logout } = useAuth();
  const initials =
    user?.displayName
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase() || 'U';

  return (
    <Bar>
      <Left>
        <MobileLogo>
          <img
            src="/finpal-logo.png"
            alt="FinPal"
            style={{
              height: '30px',
              width: 'auto',
              background: '#0C2965',
              borderRadius: '8px',
              padding: '4px 8px',
            }}
          />
        </MobileLogo>
        <PageTitle>{title}</PageTitle>
      </Left>
      <Right>
        {actions}
        <Button
          $variant="ghost"
          $size="sm"
          style={{ fontSize: 12 }}
          onClick={logout}
        >
          → Log Out
        </Button>
        <TopBarUser>
          <UserDetails>
            <UserName>{user?.displayName || 'User'}</UserName>
            <UserRoleText>{user?.roleLabel || 'Role'}</UserRoleText>
          </UserDetails>
          <AvatarLg>{initials}</AvatarLg>
        </TopBarUser>
      </Right>
    </Bar>
  );
};

export default TopBar;
