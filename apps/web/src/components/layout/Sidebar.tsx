import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { flexRow, truncate } from '../../styles/mixins';

// ── Styled ────────────────────────────────────────────────────────────────────
const SidebarWrapper = styled.aside<{ $collapsed: boolean }>`
  width: ${({ $collapsed }) => ($collapsed ? '64px' : '240px')};
  min-height: 100vh;
  background: #0C2B5E;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;

  @media (max-width: 767px) {
    display: none;
  }
`;

const Logo = styled.div`
  ${flexRow}
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  border-bottom: 0.5px solid #1A56A0;
  flex-shrink: 0;
`;

const LogoMark = styled.div`
  width: 36px;
  height: 36px;
  background: #1D9E75;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
  flex-shrink: 0;
`;

const LogoText = styled.span<{ $visible: boolean }>`
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.2s;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 0.75rem 0;
  overflow-y: auto;
  overflow-x: hidden;
`;

const NavSection = styled.div`
  margin-bottom: 1rem;
`;

const NavSectionLabel = styled.p<{ $visible: boolean }>`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #378ADD;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.25rem 1rem;
  margin-bottom: 0.25rem;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.15s;
  white-space: nowrap;
`;

const NavItem = styled(NavLink)<{ $collapsed: boolean }>`
  ${flexRow}
  gap: 0.75rem;
  padding: ${({ $collapsed }) => ($collapsed ? '0.625rem' : '0.625rem 1rem')};
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
  border-radius: 8px;
  margin: 1px 0.5rem;
  text-decoration: none;
  color: #85B7EB;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;

  &:hover { background: #0F3674; color: #fff; text-decoration: none; }
  &.active {
    background: #1A56A0;
    color: #fff;
    .nav-icon { color: #fff; }
  }
`;

const NavIcon = styled.span`
  font-size: 1.125rem;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
`;

const NavLabel = styled.span<{ $visible: boolean }>`
  ${truncate}
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.15s;
`;

const CollapseBtn = styled.button<{ $collapsed: boolean }>`
  ${flexRow}
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-end')};
  padding: 0.75rem 1rem;
  color: #378ADD;
  font-size: 0.875rem;
  border-top: 0.5px solid #1A56A0;
  width: 100%;
  cursor: pointer;
  transition: color 0.15s;
  &:hover { color: #fff; }
`;

const UserRow = styled.div`
  ${flexRow}
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-top: 0.5px solid #1A56A0;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1A56A0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
`;

const UserInfo = styled.div<{ $visible: boolean }>`
  flex: 1;
  min-width: 0;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.15s;
`;

const UserName = styled.p`
  font-size: 0.8125rem;
  font-weight: 500;
  color: #fff;
  ${truncate}
  margin: 0;
`;

const UserRole = styled.p`
  font-size: 0.6875rem;
  color: #85B7EB;
  ${truncate}
  margin: 0;
`;

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard',     icon: '▦',  to: '/dashboard' },
      { label: 'Loan portfolio',icon: '⊞',  to: '/portfolio' },
    ],
  },
  {
    section: 'Lending',
    items: [
      { label: 'New application', icon: '+', to: '/applications/new' },
      { label: 'Decisions',       icon: '✓', to: '/decisions' },
      { label: 'Collateral',      icon: '⬡', to: '/collateral' },
    ],
  },
  {
    section: 'Payments',
    items: [
      { label: 'SEPA payments', icon: '⇄', to: '/payments' },
      { label: 'SDD mandates',  icon: '≡', to: '/mandates' },
    ],
  },
  {
    section: 'Compliance',
    items: [
      { label: 'IFRS 9 / ECL',    icon: '◈', to: '/ifrs9' },
      { label: 'Model monitoring', icon: '◉', to: '/models' },
      { label: 'Audit evidence',   icon: '⊙', to: '/audit' },
      { label: 'CCR / AnaCredit', icon: '⊕', to: '/ccr' },
    ],
  },
  {
    section: 'Admin',
    items: [
      { label: 'Users & access', icon: '⊛', to: '/admin/users' },
      { label: 'DORA resilience',icon: '⊗', to: '/admin/dora' },
      { label: 'Stress testing', icon: '∿', to: '/admin/stress' },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
interface SidebarProps {
  userName?: string;
  userRole?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  userName = 'Jane Smith',
  userRole = 'Credit Officer',
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <SidebarWrapper $collapsed={collapsed}>
      <Logo>
        <LogoMark>S</LogoMark>
        <LogoText $visible={!collapsed}>SME Lending</LogoText>
      </Logo>

      <Nav>
        {NAV_ITEMS.map(({ section, items }) => (
          <NavSection key={section}>
            <NavSectionLabel $visible={!collapsed}>{section}</NavSectionLabel>
            {items.map(({ label, icon, to }) => (
              <NavItem key={to} to={to} $collapsed={collapsed}>
                <NavIcon className="nav-icon">{icon}</NavIcon>
                <NavLabel $visible={!collapsed}>{label}</NavLabel>
              </NavItem>
            ))}
          </NavSection>
        ))}
      </Nav>

      <UserRow>
        <Avatar>{initials}</Avatar>
        <UserInfo $visible={!collapsed}>
          <UserName>{userName}</UserName>
          <UserRole>{userRole}</UserRole>
        </UserInfo>
      </UserRow>

      <CollapseBtn
        $collapsed={collapsed}
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '▶' : '◀ Collapse'}
      </CollapseBtn>
    </SidebarWrapper>
  );
};

export default Sidebar;
