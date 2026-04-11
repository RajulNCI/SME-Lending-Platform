import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
const BorrowerPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <PageLayout title="My Applications">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
        <p style={{fontSize:'.875rem',color:'#718096',margin:0}}>Track your loan applications and messages</p>
        <Button $variant="primary" onClick={()=>navigate('/applications/new')}>+ New application</Button>
      </div>
      <Card $padding="md">
        <CardTitle>Application status</CardTitle>
        <CardDivider />
        <div style={{textAlign:'center',padding:'2rem 0'}}>
          <p style={{fontSize:'2rem',margin:'0 0 .5rem'}}>📋</p>
          <p style={{fontWeight:600,color:'#0C2B5E',margin:'0 0 .5rem'}}>No applications yet</p>
          <p style={{fontSize:'.875rem',color:'#718096',margin:'0 0 1.25rem'}}>Submit your first application to get started</p>
          <Button $variant="primary" onClick={()=>navigate('/applications/new')}>Start application</Button>
        </div>
      </Card>
      <Card $padding="md" style={{marginTop:'1rem'}}>
        <CardTitle>Your rights under GDPR Article 22</CardTitle>
        <CardDivider />
        <div style={{display:'flex',flexDirection:'column',gap:'.625rem'}}>
          {[
            {icon:'📄',title:'Right to explanation',desc:'You can request a plain-language explanation of any automated credit decision'},
            {icon:'👤',title:'Right to human review',desc:'You can request a credit officer reviews any automated decision'},
            {icon:'📢',title:'Right to appeal',desc:'You can appeal any adverse decision — response within 30 days'},
          ].map(r=>(
            <div key={r.title} style={{display:'flex',gap:'.75rem',padding:'.75rem',background:'#F0F7FF',borderRadius:'8px'}}>
              <span style={{fontSize:'1.25rem'}}>{r.icon}</span>
              <div>
                <p style={{fontWeight:500,color:'#0C2B5E',margin:'0 0 .25rem',fontSize:'.875rem'}}>{r.title}</p>
                <p style={{fontSize:'.8125rem',color:'#4A5568',margin:0}}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageLayout>
  );
};
export default BorrowerPage;