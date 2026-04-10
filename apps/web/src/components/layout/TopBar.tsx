import React from 'react';
import styled from 'styled-components';
import { flexBetween, flexRow, bodySm } from '../../styles/mixins';
import { Badge } from '../ui/Badge';

const Bar = styled.header`
  ${flexBetween}
  height: 60px;
  padding: 0 1.5rem;
  background: #fff;
  border-bottom: 0.5px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;

  @media (max-width: 767px) {
    padding: 0 1rem;
  }
`;

const Left = styled.div`
  ${flexRow}
  gap: 1rem;
`;

const PageTitle = styled.h1`
  font-family: 'Inter', sans-serif;
  font-size: 1.0625rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary[800]};
  margin: 0;
`;

const Breadcrumb = styled.p`
  ${bodySm}
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0;

  @media (max-width: 480px) { display: none; }
`;

const Right = styled.div`
  ${flexRow}
  gap: 0.75rem;
`;

const NotifBtn = styled.button`
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.gray[100]}; }
`;

const NotifDot = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.error};
  border: 2px solid #fff;
`;

const MobileLogo = styled.div`
  display: none;
  align-items: center;
  gap: 0.5rem;
  @media (max-width: 767px) { display: flex; }
`;

const LogoMark = styled.div`
  width: 30px;
  height: 30px;
  background: #0C2B5E;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  color: #fff;
`;

const LogoText = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary[800]};
  @media (max-width: 480px) { display: none; }
`;

interface TopBarProps {
  title: string;
  breadcrumb?: string;
  notifCount?: number;
}

const TopBar: React.FC<TopBarProps> = ({ title, breadcrumb, notifCount = 0 }) => (
  <Bar>
    <Left>
      <MobileLogo>
        <LogoMark>S</LogoMark>
        <LogoText>SME Lending</LogoText>
      </MobileLogo>
      <div>
        <PageTitle>{title}</PageTitle>
        {breadcrumb && <Breadcrumb>{breadcrumb}</Breadcrumb>}
      </div>
    </Left>

    <Right>
      <Badge $variant="success" $dot>Live</Badge>
      <NotifBtn aria-label="Notifications">
        🔔
        {notifCount > 0 && <NotifDot />}
      </NotifBtn>
    </Right>
  </Bar>
);

export default TopBar;
