import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
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
      <p style={{fontSize:'.75rem',color:'#A0AEC0',marginBottom:'1rem',fontStyle:'italic'}}>{DYNAMIC}</p>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'1rem'}}>
        <div style={{display:'flex',gap:'.5rem'}}>
          <Badge $variant="info">{users.length} users</Badge>
          <Badge $variant="success">SCIM active</Badge>
          <Badge $variant="success">MFA enforced</Badge>
        </div>
        <Button $variant="primary" $size="sm">+ Provision user</Button>
      </div>
      <Card $padding="sm">
        <CardTitle style={{padding:'0 .5rem .75rem'}}>Platform users — RBAC</CardTitle>
        <CardDivider />
        {users.map((u,i)=>(
          <div key={u.username} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.75rem .5rem',borderBottom:i<users.length-1?'.5px solid #F0F0F0':'none',fontSize:'.875rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
              <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#E6F1FB',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'.75rem',color:'#0C2B5E'}}>
                {u.name.split(' ').map((n:string)=>n[0]).join('')}
              </div>
              <div>
                <p style={{margin:0,fontWeight:500,color:'#2D3748'}}>{u.name}</p>
                <p style={{margin:0,fontSize:'.75rem',color:'#A0AEC0',fontFamily:"'IBM Plex Mono',monospace"}}>{u.username}</p>
              </div>
            </div>
            <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
              <Badge $variant="info" $size="sm">{u.role}</Badge>
              <Badge $variant={u.mfa?'success':'warning'} $size="sm">{u.mfa?'MFA ✓':'No MFA'}</Badge>
              <Badge $variant="success" $size="sm">{u.status}</Badge>
            </div>
          </div>
        ))}
      </Card>
    </PageLayout>
  );
};
export default AdminUsersPage;