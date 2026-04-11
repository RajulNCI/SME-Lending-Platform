import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
const DYNAMIC = 'Collections data from GET /api/v1/collections/summary';
const CollectionsPage: React.FC = () => (
  <PageLayout title="Collections & Borrower Protection">
    <p style={{fontSize:'.75rem',color:'#A0AEC0',marginBottom:'1rem',fontStyle:'italic'}}>{DYNAMIC}</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'.75rem',marginBottom:'1.25rem'}}>
      {[
        {label:'Active collections',value:'0',note:'No delinquent accounts',color:'#0F6E56'},
        {label:'Hardship cases',value:'0',note:'No active hardship',color:'#0F6E56'},
        {label:'Over-indebtedness alerts',value:'1',note:'Ferris Hospitality flagged',color:'#A32D2D'},
      ].map(s=>(
        <div key={s.label} style={{background:'#F7FAFC',borderRadius:'10px',padding:'1rem',border:'.5px solid #E2E8F0'}}>
          <p style={{fontSize:'.6875rem',fontWeight:600,color:'#718096',textTransform:'uppercase',letterSpacing:'.05em',margin:'0 0 .25rem'}}>{s.label}</p>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:'1.75rem',fontWeight:700,color:s.color,margin:'0 0 .125rem'}}>{s.value}</p>
          <p style={{fontSize:'.6875rem',color:'#A0AEC0',margin:0}}>{s.note}</p>
        </div>
      ))}
    </div>
    <Card $padding="md">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
        <CardTitle>Borrower protection controls</CardTitle>
        <Badge $variant="info">CGAP framework</Badge>
      </div>
      <p style={{fontSize:'.8125rem',color:'#718096',marginBottom:'.75rem'}}>Collections practices follow CGAP responsible digital credit guidelines. All treatment codes and actions are logged to immutable audit trails.</p>
      <CardDivider />
      {[
        {label:'Over-indebtedness screening',value:'Active — DTI ratio checked at origination'},
        {label:'Hardship/rescheduling pathway',value:'Available — champion/challenger strategy'},
        {label:'Contact channel optimisation',value:'Empathetic comms templates active'},
        {label:'Behavioural nudges',value:'Enabled with guardrails'},
        {label:'Consumer protection checks',value:'CGAP-aligned safeguards active'},
        {label:'Data misuse prevention',value:'PII access controls + audit logging'},
      ].map(r=>(
        <div key={r.label} style={{display:'flex',justifyContent:'space-between',padding:'.625rem 0',borderBottom:'.5px solid #F0F0F0',fontSize:'.875rem'}}>
          <span style={{color:'#718096'}}>{r.label}</span>
          <span style={{fontWeight:500,color:'#1A56A0',textAlign:'right',maxWidth:'55%',fontFamily:"'IBM Plex Mono',monospace",fontSize:'.8125rem'}}>{r.value}</span>
        </div>
      ))}
    </Card>
  </PageLayout>
);
export default CollectionsPage;