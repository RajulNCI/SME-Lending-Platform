import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  DynamicNote,
  HeaderContainer,
  BadgesContainer,
  UserRow,
  UserInfoContainer,
  Avatar,
  UserName,
  UserUsername,
  UserBadgesContainer,
} from '../../styles/pages/AdminUsersPage.styles';

const DYNAMIC = 'User data from GET /api/v1/admin/users — SCIM provisioning active';

const AdminUsersPage: React.FC = () => {
  const users = [
    {name:'Jane Smith',username:'credit.officer',role:'Credit Officer',status:'Active',mfa:true},
    {name:'Liam Murphy',username:'risk.manager',role:'Risk Manager',status:'Active',mfa:true},
    {name:'Aoife Kelly',username:'compliance.officer',role:'Compliance Officer',status:'Active',mfa:true},
    {name:"Sean O'Brien",username:'ops.manager',role:'Operations Manager',status:'Active',mfa:true},
    {name:'Ciara Walsh',username:'it.admin',role:'IT Administrator',status:'Active',mfa:true},
    {name:'Niall Byrne',username:'mrm.analyst',role:'MRM Analyst',status:'Active',mfa:true},
    {name:'Roisin Doyle',username:'collections.officer',role:'Collections Officer',status:'Active',mfa:true},
    {name:'Acme Ltd',username:'borrower.sme',role:'SME Borrower',status:'Active',mfa:false},
  ];

  return (
    <PageLayout title="User Management">
      <DynamicNote>{DYNAMIC}</DynamicNote>
      <HeaderContainer>
        <BadgesContainer>
          <Badge $variant="info">{users.length} users</Badge>
          <Badge $variant="success">SCIM active</Badge>
          <Badge $variant="success">MFA enforced</Badge>
        </BadgesContainer>
        <Button $variant="primary" $size="sm">+ Provision user</Button>
      </HeaderContainer>
      <Card $padding="sm">
        <CardTitle style={{padding:'0 .5rem .75rem'}}>Platform users — RBAC</CardTitle>
        <CardDivider />
        {users.map((u,i)=>(
          <UserRow key={u.username} $isLast={i === users.length - 1}>
            <UserInfoContainer>
              <Avatar>
                {u.name.split(' ').map((n:string)=>n[0]).join('')}
              </Avatar>
              <div>
                <UserName>{u.name}</UserName>
                <UserUsername>{u.username}</UserUsername>
              </div>
            </UserInfoContainer>
            <UserBadgesContainer>
              <Badge $variant="info" $size="sm">{u.role}</Badge>
              <Badge $variant={u.mfa?'success':'warning'} $size="sm">{u.mfa?'MFA ✓':'No MFA'}</Badge>
              <Badge $variant="success" $size="sm">{u.status}</Badge>
            </UserBadgesContainer>
          </UserRow>
        ))}
      </Card>
    </PageLayout>
  );
};
export default AdminUsersPage;