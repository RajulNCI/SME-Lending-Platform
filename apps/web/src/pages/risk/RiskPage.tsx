import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
const DYNAMIC_MODEL = 'Model metrics from GET /api/v1/models/health — PSI/Gini calculated nightly';
const DYNAMIC_STRESS = 'Stress test results from GET /api/v1/stress-tests/latest';
const RiskPage: React.FC = () => (
  <PageLayout title="Risk Management" notifCount={1}>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
      <Card $padding="md">
        <CardTitle>Model health</CardTitle>
        <CardDivider />
        <p style={{fontSize:'.75rem',color:'#A0AEC0',marginBottom:'1rem',fontStyle:'italic'}}>{DYNAMIC_MODEL}</p>
        {[
          {label:'PSI score',value:'0.04',ok:true,note:'Stable — threshold 0.10'},
          {label:'Gini coefficient',value:'0.68',ok:true,note:'Above threshold 0.60'},
          {label:'AUC score',value:'0.84',ok:true,note:'Above threshold 0.80'},
          {label:'Model version',value:'v2.4.1',ok:true,note:'Validated 28 Mar 2025'},
        ].map(r=>(
          <div key={r.label} style={{display:'flex',justifyContent:'space-between',padding:'.5rem 0',borderBottom:'.5px solid #F0F0F0',fontSize:'.875rem'}}>
            <span style={{color:'#718096'}}>{r.label}</span>
            <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
              <span style={{fontWeight:600,color:'#0C2B5E',fontFamily:"'IBM Plex Mono',monospace"}}>{r.value}</span>
              <Badge $variant={r.ok?'success':'error'} $size="sm">{r.note}</Badge>
            </div>
          </div>
        ))}
      </Card>
      <Card $padding="md">
        <CardTitle>Stress testing</CardTitle>
        <CardDivider />
        <p style={{fontSize:'.75rem',color:'#A0AEC0',marginBottom:'1rem',fontStyle:'italic'}}>{DYNAMIC_STRESS}</p>
        {[
          {label:'EBA Base scenario',value:'ECL +€124K',ok:true},
          {label:'EBA Adverse scenario',value:'ECL +€412K',ok:true},
          {label:'EBA Severely adverse',value:'ECL +€891K',ok:false},
          {label:'Last run',value:'Q1 2025',ok:true},
        ].map(r=>(
          <div key={r.label} style={{display:'flex',justifyContent:'space-between',padding:'.5rem 0',borderBottom:'.5px solid #F0F0F0',fontSize:'.875rem'}}>
            <span style={{color:'#718096'}}>{r.label}</span>
            <span style={{fontWeight:600,color:r.ok?'#0C2B5E':'#A32D2D',fontFamily:"'IBM Plex Mono',monospace"}}>{r.value}</span>
          </div>
        ))}
      </Card>
    </div>
  </PageLayout>
);
export default RiskPage;