import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { getDecisions } from '../../services/AIApi';
import { NAV } from './sidebarNav';

// ── Styled components ──────────────────────────────────────────────────────────

const Wrap = styled.aside<{ $c: boolean }>`
  width: ${({ $c }) => ($c ? '60px' : '230px')};
  min-height: 100vh;
  background: #0c2b5e;
  display: flex;
  flex-direction: column;
  transition: width 0.25s;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  @media (max-width: 767px) { display: none; }
`;
const Logo = styled.div`
  display: flex; align-items: center; gap: 0.625rem;
  padding: 1rem; border-bottom: 0.5px solid #1a56a0; flex-shrink: 0;
`;
const LogoMark = styled.div`
  width: 36px; height: 36px; background: #1d9e75; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.9375rem; color: #fff; flex-shrink: 0;
`;
const LogoText = styled.div<{ $v: boolean }>`
  opacity: ${({ $v }) => ($v ? 1 : 0)}; transition: opacity 0.2s; white-space: nowrap;
`;
const Nav = styled.nav`
  flex: 1; padding: 0.5rem 0; overflow-y: auto; overflow-x: hidden;
`;
const Section = styled.div`margin-bottom: 0.75rem;`;
const SectionLabel = styled.p<{ $v: boolean }>`
  font-size: 0.5625rem; font-weight: 700; color: #378add;
  text-transform: uppercase; letter-spacing: 0.1em;
  padding: 0.25rem 0.875rem; margin-bottom: 0.125rem;
  opacity: ${({ $v }) => ($v ? 1 : 0)}; transition: opacity 0.15s; white-space: nowrap;
  ${({ $v }) => !$v && `height:0;margin:0;padding:0;overflow:hidden;`}
`;
const NavItem = styled(NavLink)<{ $c: boolean }>`
  display: flex; align-items: center; gap: 0.625rem;
  padding: ${({ $c }) => ($c ? '.5rem' : '.5rem .875rem')};
  justify-content: ${({ $c }) => ($c ? 'center' : 'flex-start')};
  border-radius: 8px; margin: 1px 0.375rem; text-decoration: none;
  color: #85b7eb; font-size: 0.8125rem; font-weight: 500;
  transition: background 0.12s, color 0.12s; white-space: nowrap;
  &:hover { background: #0f3674; color: #fff; text-decoration: none; }
  &.active { background: #1a56a0; color: #fff; }
`;
const NavIcon = styled.span`
  font-size: 0.9375rem; flex-shrink: 0; width: 18px; text-align: center;
`;
const NavLabel = styled.span<{ $v: boolean }>`
  opacity: ${({ $v }) => ($v ? 1 : 0)}; transition: opacity 0.15s; flex: 1; white-space: nowrap;
  ${({ $v }) => !$v && `width:0;flex:none;overflow:hidden;`}
`;
const NavBadge = styled.span<{ $v: boolean; $n: number }>`
  background: ${({ $n }) => ($n > 0 ? '#E24B4A' : '#1A56A0')};
  color: #fff; font-size: 0.5625rem; font-weight: 700;
  padding: 1px 5px; border-radius: 8px; flex-shrink: 0; min-width: 16px; text-align: center;
  opacity: ${({ $v, $n }) => ($v && $n >= 0 ? 1 : 0)}; transition: opacity 0.15s;
  ${({ $v }) => !$v && `display:none;`}
`;
const CollapseBtn = styled.button<{ $c: boolean }>`
  display: flex; align-items: center;
  justify-content: ${({ $c }) => ($c ? 'center' : 'flex-end')};
  padding: 0.625rem 1rem; color: #378add; font-size: 0.75rem;
  border-top: 0.5px solid #1a56a0; width: 100%; cursor: pointer;
  transition: color 0.12s; &:hover { color: #fff; }
`;

// ── Component ──────────────────────────────────────────────────────────────────

const ROLES_WITH_QUEUE = ['CREDIT_OFFICER', 'SENIOR_CREDIT_OFFICER', 'COMPLIANCE_OFFICER', 'BRANCH_MANAGER', 'ADMIN'];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    if (!user || !ROLES_WITH_QUEUE.includes(user.role)) return;
    const load = async () => {
      try {
        const d = await getDecisions();
        setQueueCount(Array.isArray(d) ? d.length : 0);
      } catch {}
    };
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [user]);

  if (!user) return null;
  const sections = NAV[user.role] ?? [];

  return (
    <Wrap $c={collapsed}>
      <Logo>
        <LogoMark>F</LogoMark>
        <LogoText $v={!collapsed}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '.9375rem', fontWeight: 700, color: '#fff' }}>FinPal</div>
          <div style={{ fontSize: '.5625rem', color: '#1D9E75', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            v5.0 · Trustworthy AI
          </div>
        </LogoText>
      </Logo>

      <Nav>
        {sections.map((sec) => (
          <Section key={sec.label}>
            {sec.items.length > 0 && (
              <>
                <SectionLabel $v={!collapsed}>{sec.label}</SectionLabel>
                {sec.items.map((item) => (
                  <NavItem key={item.to} to={item.to} end={item.end} $c={collapsed}>
                    <NavIcon>{item.icon}</NavIcon>
                    <NavLabel $v={!collapsed}>{item.text}</NavLabel>
                    {item.badge && <NavBadge $v={!collapsed} $n={queueCount}>{queueCount}</NavBadge>}
                  </NavItem>
                ))}
              </>
            )}
          </Section>
        ))}
      </Nav>

      <CollapseBtn $c={collapsed} onClick={() => setCollapsed((c) => !c)}>
        {collapsed ? '▶' : '◀'}
      </CollapseBtn>
    </Wrap>
  );
};

export default Sidebar;
