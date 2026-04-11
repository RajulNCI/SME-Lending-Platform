import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

const Bar = styled.header`
  display:flex;align-items:center;justify-content:space-between;
  height:56px;padding:0 1.5rem;background:#fff;
  border-bottom:.5px solid #E2E8F0;flex-shrink:0;
  position:sticky;top:0;z-index:10;
  @media(max-width:767px){padding:0 1rem;}
`;
const Left = styled.div`display:flex;align-items:center;gap:1rem;`;
const MobileLogo = styled.div`
  display:none;align-items:center;gap:.5rem;
  @media(max-width:767px){display:flex;}
`;
const LogoMark = styled.div`
  width:28px;height:28px;background:#0C2B5E;border-radius:6px;
  display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:.8125rem;color:#fff;
`;
const PageTitle = styled.h1`
  font-family:'Inter',sans-serif;font-size:1rem;font-weight:600;
  color:#0C2B5E;margin:0;
`;
const Right = styled.div`display:flex;align-items:center;gap:.75rem;`;
const RoleChip = styled.div`
  display:flex;align-items:center;gap:.5rem;padding:.25rem .75rem;
  background:#F0F7FF;border-radius:6px;border:.5px solid #B5D4F4;
  @media(max-width:480px){display:none;}
`;
const RoleText = styled.span`font-size:.75rem;font-weight:600;color:#0C2B5E;font-family:'Inter',sans-serif;`;
const Avatar = styled.div`
  width:30px;height:30px;border-radius:50%;background:#0C2B5E;
  display:flex;align-items:center;justify-content:center;
  font-size:.6875rem;font-weight:700;color:#fff;flex-shrink:0;
`;
const NotifBtn = styled.button`
  width:34px;height:34px;border-radius:8px;display:flex;align-items:center;
  justify-content:center;font-size:1rem;color:#718096;position:relative;
  transition:background .12s;&:hover{background:#F7FAFC;}
`;
const NotifDot = styled.span`
  position:absolute;top:5px;right:5px;width:7px;height:7px;
  border-radius:50%;background:#E24B4A;border:2px solid #fff;
`;

interface TopBarProps { title: string; notifCount?: number; }

const TopBar: React.FC<TopBarProps> = ({ title, notifCount = 0 }) => {
  const { user } = useAuth();
  const initials = user?.displayName.split(' ').map((n:string)=>n[0]).join('').toUpperCase() || 'U';

  return (
    <Bar>
      <Left>
        <MobileLogo>
          <LogoMark>F</LogoMark>
        </MobileLogo>
        <PageTitle>{title}</PageTitle>
      </Left>
      <Right>
        <Badge $variant="success" $dot>Live</Badge>
        {user && (
          <RoleChip>
            <RoleText>{user.roleLabel}</RoleText>
          </RoleChip>
        )}
        <NotifBtn>
          🔔
          {notifCount > 0 && <NotifDot />}
        </NotifBtn>
        <Avatar>{initials}</Avatar>
      </Right>
    </Bar>
  );
};

export default TopBar;
