import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
const DYNAMIC = 'MRM metrics from GET /api/v1/models/monitoring — daily scorecard pipeline';
const MrmPage: React.FC = () => (
  <PageLayout title="Model Risk Management">
    <p style={{fontSize:'.75rem',color:'#A0AEC0',marginBottom:'1rem',fontStyle:'italic'}}>{DYNAMIC}</p>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
      <Card $padding="md">
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'.75rem'}}>
          <CardTitle>Model inventory</CardTitle>
          <Badge $variant="success">Active</Badge>
        </div>
        <CardDivider />
        {[
          {k:'Current champion',v:'finpal-pd-v2.4.1'},
          {k:'Challenger model',v:'finpal-pd-v2.5.0-rc'},
          {k:'Last validated',v:'28 Mar 2025'},
          {k:'Next review',v:'28 Apr 2025'},
          {k:'AUC',v:'0.84 ≥ 0.80 ✓'},
          {k:'Gini',v:'0.68 ≥ 0.60 ✓'},
          {k:'PSI (monthly)',v:'0.04 < 0.10 ✓'},
        ].map(r=>(
          <div key={r.k} style={{display:'flex',justifyContent:'space-between',padding:'.5rem 0',borderBottom:'.5px solid #F0F0F0',fontSize:'.8125rem'}}>
            <span style={{color:'#718096'}}>{r.k}</span>
            <span style={{fontWeight:600,color:'#0C2B5E',fontFamily:"'IBM Plex Mono',monospace"}}>{r.v}</span>
          </div>
        ))}
      </Card>
      <Card $padding="md">
        <CardTitle>Drift monitoring</CardTitle>
        <CardDivider />
        <div style={{padding:'1rem 0',textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'.5rem'}}>✓</div>
          <p style={{fontWeight:600,color:'#0F6E56',margin:'0 0 .25rem'}}>No drift detected</p>
          <p style={{fontSize:'.8125rem',color:'#718096',margin:0}}>PSI 0.04 — well below 0.10 threshold</p>
        </div>
        <CardDivider />
        <p style={{fontSize:'.8125rem',color:'#718096',marginBottom:'.5rem'}}>Drift alert triggers:</p>
        {[
          {label:'PSI threshold',value:'≥ 0.10 (currently 0.04)'},
          {label:'Gini drop',value:'≥ 10% decline'},
          {label:'KS statistic',value:'≥ 10% drop'},
        ].map(r=>(
          <div key={r.label} style={{display:'flex',justifyContent:'space-between',padding:'.375rem 0',fontSize:'.8125rem'}}>
            <span style={{color:'#718096'}}>{r.label}</span>
            <span style={{color:'#0C2B5E',fontFamily:"'IBM Plex Mono',monospace"}}>{r.value}</span>
          </div>
        ))}
      </Card>
    </div>
  </PageLayout>
);
export default MrmPage;