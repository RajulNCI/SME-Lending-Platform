import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';

const Wrap = styled.aside<{$c:boolean}>`
  width:${({$c})=>$c?'60px':'230px'};min-height:100vh;background:#0C2B5E;
  display:flex;flex-direction:column;transition:width .25s;flex-shrink:0;
  position:sticky;top:0;height:100vh;overflow:hidden;
  @media(max-width:767px){display:none;}
`;
const Logo = styled.div`
  display:flex;align-items:center;gap:.625rem;padding:1rem;
  border-bottom:.5px solid #1A56A0;flex-shrink:0;
`;
const LogoMark = styled.div`
  width:36px;height:36px;background:#1D9E75;border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:.9375rem;color:#fff;flex-shrink:0;
`;
const LogoText = styled.div<{$v:boolean}>`
  opacity:${({$v})=>$v?1:0};transition:opacity .2s;white-space:nowrap;
`;
const LogoName = styled.div`font-family:'Inter',sans-serif;font-size:.9375rem;font-weight:700;color:#fff;`;
const LogoSub = styled.div`font-size:.5625rem;color:#1D9E75;font-weight:600;letter-spacing:.08em;text-transform:uppercase;`;

const Nav = styled.nav`flex:1;padding:.5rem 0;overflow-y:auto;overflow-x:hidden;`;
const Section = styled.div`margin-bottom:.75rem;`;
const SectionLabel = styled.p<{$v:boolean}>`
  font-size:.5625rem;font-weight:700;color:#378ADD;text-transform:uppercase;
  letter-spacing:.1em;padding:.25rem .875rem;margin-bottom:.125rem;
  opacity:${({$v})=>$v?1:0};transition:opacity .15s;white-space:nowrap;
`;
const NavItem = styled(NavLink)<{$c:boolean}>`
  display:flex;align-items:center;gap:.625rem;
  padding:${({$c})=>$c?'.5rem':'.5rem .875rem'};
  justify-content:${({$c})=>$c?'center':'flex-start'};
  border-radius:8px;margin:1px .375rem;text-decoration:none;
  color:#85B7EB;font-size:.8125rem;font-weight:500;
  transition:background .12s,color .12s;white-space:nowrap;
  &:hover{background:#0F3674;color:#fff;text-decoration:none;}
  &.active{background:#1A56A0;color:#fff;}
`;
const NavIcon = styled.span`font-size:.9375rem;flex-shrink:0;width:18px;text-align:center;`;
const NavLabel = styled.span<{$v:boolean}>`opacity:${({$v})=>$v?1:0};transition:opacity .15s;flex:1;`;
const NavBadge = styled.span<{$v:boolean}>`
  background:#E24B4A;color:#fff;font-size:.5625rem;font-weight:700;
  padding:1px 5px;border-radius:8px;flex-shrink:0;
  opacity:${({$v})=>$v?1:0};transition:opacity .15s;
`;

const UserRow = styled.div`
  display:flex;align-items:center;gap:.625rem;padding:.75rem 1rem;
  border-top:.5px solid #1A56A0;
`;
const Avatar = styled.div`
  width:30px;height:30px;border-radius:50%;background:#1A56A0;
  display:flex;align-items:center;justify-content:center;
  font-size:.625rem;font-weight:700;color:#fff;flex-shrink:0;
`;
const UserInfo = styled.div<{$v:boolean}>`flex:1;min-width:0;opacity:${({$v})=>$v?1:0};transition:opacity .15s;`;
const UserName = styled.p`font-size:.75rem;font-weight:500;color:#fff;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
const UserRole2 = styled.p`font-size:.625rem;color:#85B7EB;margin:0;white-space:nowrap;`;

const CollapseBtn = styled.button<{$c:boolean}>`
  display:flex;align-items:center;justify-content:${({$c})=>$c?'center':'flex-end'};
  padding:.625rem 1rem;color:#378ADD;font-size:.75rem;border-top:.5px solid #1A56A0;
  width:100%;cursor:pointer;transition:color .12s;&:hover{color:#fff;}
`;

const LogoutBtn = styled.button`
  display:flex;align-items:center;gap:.625rem;width:100%;
  padding:.5rem .875rem;border-radius:8px;margin:1px .375rem;
  color:#F09595;font-size:.8125rem;font-weight:500;
  transition:background .12s,color .12s;
  &:hover{background:#3D1A1A;color:#fff;}
`;

// Nav config per role
type NavSection = { label: string; items: { icon: string; text: string; to: string; badge?: number }[] };

const NAV: Record<UserRole, NavSection[]> = {
  credit_officer: [
    { label: 'Platform', items: [
      { icon: '↑', text: 'Intake Pipeline', to: '/intake' },
      { icon: '☰', text: 'Queue', to: '/queue', badge: 3 },
      { icon: '◧', text: 'Audit Trail', to: '/audit' },
    ]},
    { label: 'Risk & Compliance', items: [] },
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
  risk_manager: [
    { label: 'Platform', items: [
      { icon: '▦', text: 'Dashboard', to: '/dashboard' },
      { icon: '◉', text: 'Model monitoring', to: '/risk/models' },
      { icon: '∿', text: 'Stress testing', to: '/risk/stress' },
      { icon: '⚑', text: 'Early warnings', to: '/risk/ewi' },
    ]},
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
  compliance_officer: [
    { label: 'Platform', items: [
      { icon: '◧', text: 'Audit Trail', to: '/audit' },
      { icon: '⊕', text: 'CCR / AnaCredit', to: '/ccr' },
      { icon: '⊙', text: 'GDPR requests', to: '/gdpr' },
    ]},
    { label: 'Risk & Compliance', items: [] },
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
  ops_manager: [
    { label: 'Operations', items: [
      { icon: '▦', text: 'Dashboard', to: '/dashboard' },
      { icon: '⇄', text: 'SEPA payments', to: '/payments' },
      { icon: '≡', text: 'SDD mandates', to: '/mandates' },
      { icon: '◎', text: 'SLA monitor', to: '/sla' },
    ]},
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
  it_admin: [
    { label: 'Administration', items: [
      { icon: '⊛', text: 'User management', to: '/admin/users' },
      { icon: '⊗', text: 'DORA resilience', to: '/admin/dora' },
      { icon: '≡', text: 'API management', to: '/admin/api' },
      { icon: '⊕', text: 'TPRM register', to: '/admin/tprm' },
    ]},
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
  mrm_analyst: [
    { label: 'Model Risk', items: [
      { icon: '◉', text: 'Model inventory', to: '/mrm' },
      { icon: '▦', text: 'PSI / Gini', to: '/mrm/metrics' },
      { icon: '⚑', text: 'Drift alerts', to: '/mrm/drift' },
      { icon: '⊞', text: 'Champion-challenger', to: '/mrm/challenger' },
    ]},
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
  collections_officer: [
    { label: 'Operations', items: [
      { icon: '↺', text: 'Collections', to: '/collections' },
      { icon: '✉', text: 'Bureau reporting', to: '/bureau' },
      { icon: '≡', text: 'SDD mandates', to: '/mandates' },
    ]},
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
  borrower_sme: [
    { label: 'My applications', items: [
      { icon: '+', text: 'New application', to: '/borrower/apply' },
      { icon: '☰', text: 'My applications', to: '/borrower' },
      { icon: '✉', text: 'Messages', to: '/borrower/messages' },
    ]},
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
};

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  if (!user) return null;

  const sections = NAV[user.role] || [];
  const initials = user.displayName.split(' ').map((n:string)=>n[0]).join('').toUpperCase();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <Wrap $c={collapsed}>
      <Logo>
        <LogoMark>F</LogoMark>
        <LogoText $v={!collapsed}>
          <LogoName>FinPal</LogoName>
          <LogoSub>v5.0 · Trustworthy AI</LogoSub>
        </LogoText>
      </Logo>

      <Nav>
        {sections.map(sec => (
          <Section key={sec.label}>
            {sec.items.length > 0 && (
              <>
                <SectionLabel $v={!collapsed}>{sec.label}</SectionLabel>
                {sec.items.map(item => (
                  <NavItem key={item.to} to={item.to} $c={collapsed}>
                    <NavIcon>{item.icon}</NavIcon>
                    <NavLabel $v={!collapsed}>{item.text}</NavLabel>
                    {item.badge && <NavBadge $v={!collapsed}>{item.badge}</NavBadge>}
                  </NavItem>
                ))}
              </>
            )}
          </Section>
        ))}
        <LogoutBtn onClick={handleLogout}>
          <NavIcon>→</NavIcon>
          <NavLabel $v={!collapsed}>Log out</NavLabel>
        </LogoutBtn>
      </Nav>

      <UserRow>
        <Avatar>{initials}</Avatar>
        <UserInfo $v={!collapsed}>
          <UserName>{user.displayName}</UserName>
          <UserRole2>{user.roleLabel}</UserRole2>
        </UserInfo>
      </UserRow>

      <CollapseBtn $c={collapsed} onClick={()=>setCollapsed(c=>!c)}>
        {collapsed ? '▶' : '◀'}
      </CollapseBtn>
    </Wrap>
  );
};

export default Sidebar;
