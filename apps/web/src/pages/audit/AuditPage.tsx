import React, { useState } from 'react';
import styled from 'styled-components';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const DYNAMIC = 'Audit log: immutable WORM store · GET /api/v1/audit/evidence?id={applicationId}';

const SearchRow = styled.div`display:flex;gap:.75rem;margin-bottom:1.25rem;`;
const SearchInput = styled.input`
  flex:1;height:44px;padding:0 1rem;border:1.5px solid #E2E8F0;border-radius:8px;
  font-size:14px;font-family:'IBM Plex Mono',monospace;
  &::placeholder{color:#A0AEC0;font-family:'IBM Plex Sans',sans-serif;}
  &:focus{outline:none;border-color:#378ADD;box-shadow:0 0 0 3px rgba(55,138,221,.15);}
`;
const ComplianceBox = styled.div`
  background:#F0F7FF;border:1px solid #B5D4F4;border-radius:10px;
  padding:1rem 1.25rem;margin-bottom:1.25rem;
`;
const ComplianceTitle = styled.p`font-size:.875rem;font-weight:600;color:#0C2B5E;margin:0 0 .25rem;`;
const ComplianceDesc = styled.p`font-size:.8125rem;color:#4A5568;margin:0;line-height:1.5;`;

const AuditRow = styled.div`
  display:flex;align-items:flex-start;gap:1rem;padding:.875rem 0;
  border-bottom:.5px solid #F0F0F0;&:last-child{border:none;}cursor:pointer;
  &:hover{background:#FAFBFC;margin:0 -.75rem;padding:.875rem .75rem;border-radius:8px;}
`;
const AuditDate = styled.div`
  font-size:.75rem;color:#A0AEC0;font-family:'IBM Plex Mono',monospace;
  min-width:80px;margin-top:2px;
`;
const AuditBody = styled.div`flex:1;`;
const AuditTitle = styled.p`font-size:.875rem;font-weight:500;color:#1A56A0;margin:0 0 .25rem;`;
const AuditMeta = styled.p`font-size:.75rem;color:#718096;margin:0;font-family:'IBM Plex Mono',monospace;`;

const EvidenceModal = styled.div`
  background:#F7FAFC;border:1px solid #E2E8F0;border-radius:12px;
  padding:1.25rem;margin-top:1rem;
`;
const EvidenceTitle = styled.p`font-size:.875rem;font-weight:600;color:#0C2B5E;margin:0 0 .75rem;`;
const EvidenceRow = styled.div`
  display:flex;justify-content:space-between;padding:.375rem 0;
  border-bottom:.5px solid #E2E8F0;&:last-child{border:none;}font-size:.8125rem;
`;
const EvidenceLabel = styled.span`color:#718096;`;
const EvidenceValue = styled.span`font-weight:500;color:#2D3748;font-family:'IBM Plex Mono',monospace;text-align:right;max-width:60%;`;

const auditLog = [
  { date:'18 Feb 2025', company:"O'Brien Construction Ltd", id:'FP-2025-0041', purpose:'Working Capital', amount:'€420,000', status:'Assessment Complete', variant:'success',
    evidence:{ modelVersion:'finpal-pd-v2.4.1', decision:'Approved', grade:'B1', pd:'3.4%', approver:'Jane Smith (CO)', consentRef:'FP-2025-0041-AIS', shapRef:'SHAP-0041-v2.4.1', immutableHash:'sha256:a1b2c3d4e5f6...', timestamp:'2025-02-18T14:22:31Z' }},
  { date:'22 Mar 2025', company:'Meridian Retail Ltd', id:'FP-2025-0043', purpose:'Working Capital', amount:'€280,000', status:'HITL Mandatory', variant:'warning', hitl:true,
    evidence:{ modelVersion:'finpal-pd-v2.4.1', decision:'Pending HITL', grade:'C1', pd:'8.9%', approver:'Pending assignment', consentRef:'FP-2025-0043-AIS', shapRef:'SHAP-0043-v2.4.1', immutableHash:'sha256:b2c3d4e5f6a7...', timestamp:'2025-03-22T09:14:07Z' }},
  { date:'15 Feb 2025', company:'Ferris Hospitality Group', id:'FP-2025-0040', purpose:'Working Capital', amount:'€310,000', status:'Flagged', variant:'error',
    evidence:{ modelVersion:'finpal-pd-v2.4.1', decision:'Declined', grade:'D1', pd:'18.4%', approver:'Jane Smith (CO)', consentRef:'FP-2025-0040-AIS', shapRef:'SHAP-0040-v2.4.1', immutableHash:'sha256:c3d4e5f6a7b8...', timestamp:'2025-02-15T11:08:52Z' }},
  { date:'12 Feb 2025', company:'GreenwayTech Solutions', id:'FP-2025-0039', purpose:'Working Capital', amount:'€90,000', status:'Approved', variant:'success',
    evidence:{ modelVersion:'finpal-pd-v2.4.1', decision:'Approved (STP)', grade:'A2', pd:'1.2%', approver:'Auto-approved (STP)', consentRef:'FP-2025-0039-AIS', shapRef:'SHAP-0039-v2.4.1', immutableHash:'sha256:d4e5f6a7b8c9...', timestamp:'2025-02-12T16:44:19Z' }},
];

const AuditPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string|null>(null);

  const filtered = auditLog.filter(a=>
    !search || a.id.toLowerCase().includes(search.toLowerCase()) ||
    a.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout title="Audit Trail" notifCount={0}>
      <p style={{fontSize:'.75rem',color:'#A0AEC0',marginBottom:'1rem',fontStyle:'italic'}}>{DYNAMIC}</p>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'.75rem',marginBottom:'1.25rem'}}>
        {[
          {label:'Total records',value:'4',sub:'All decisions logged'},
          {label:'EU AI Act Art.12',value:'100%',sub:'Compliant'},
          {label:'CBI inspection',value:'Ready',sub:'Export available'},
        ].map(s=>(
          <div key={s.label} style={{background:'#F7FAFC',borderRadius:'10px',padding:'.875rem 1rem',border:'.5px solid #E2E8F0'}}>
            <p style={{fontSize:'.6875rem',fontWeight:600,color:'#718096',textTransform:'uppercase',letterSpacing:'.05em',margin:'0 0 .25rem'}}>{s.label}</p>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:'1.375rem',fontWeight:700,color:'#0C2B5E',margin:'0 0 .125rem'}}>{s.value}</p>
            <p style={{fontSize:'.6875rem',color:'#A0AEC0',margin:0}}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <SearchRow>
        <SearchInput
          placeholder="Search by application ID e.g. FP-2025-0041"
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
        <Button $variant="primary">Retrieve pack</Button>
        <Button $variant="secondary">↓ Export all (PDF)</Button>
      </SearchRow>

      {/* Available IDs */}
      <p style={{fontSize:'.75rem',color:'#718096',marginBottom:'1rem'}}>
        Available: {auditLog.map(a=>a.id).join(' · ')}
      </p>

      {/* Compliance box */}
      <ComplianceBox>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'.5rem'}}>
          <div>
            <ComplianceTitle>✓ EU AI Act Art.12 & GDPR Art.30 compliance</ComplianceTitle>
            <ComplianceDesc>
              This audit trail is cryptographically immutable using SHA-256 hash chaining.
              Every entry is timestamped and attributed. Compliant with EU AI Act Article 12
              (record-keeping), GDPR Article 30, and Central Bank of Ireland IAF PCF-11.
              Retention: 7 years minimum. WORM storage backend.
            </ComplianceDesc>
          </div>
          <Badge $variant="info">CBI-Inspection Ready</Badge>
        </div>
      </ComplianceBox>

      {/* Audit log */}
      <Card $padding="md">
        <CardHeader>
          <CardTitle>Global audit trail</CardTitle>
          <Badge $variant="neutral">{filtered.length} records</Badge>
        </CardHeader>
        <CardDivider />

        {filtered.map(entry=>(
          <div key={entry.id}>
            <AuditRow onClick={()=>setExpanded(expanded===entry.id?null:entry.id)}>
              <AuditDate>{entry.date}</AuditDate>
              <AuditBody>
                <AuditTitle>
                  {entry.company} — {entry.status}
                </AuditTitle>
                <AuditMeta>
                  {entry.id} · {entry.purpose} · {entry.amount}
                  {(entry as any).hitl && ' · ⚠ HITL MANDATORY'}
                </AuditMeta>
              </AuditBody>
              <div style={{display:'flex',gap:'.5rem',alignItems:'center',flexShrink:0}}>
                <Badge $variant={entry.variant as any}>{entry.status}</Badge>
                <span style={{fontSize:'.75rem',color:'#A0AEC0'}}>{expanded===entry.id?'▲':'▼'}</span>
              </div>
            </AuditRow>

            {expanded===entry.id && (
              <EvidenceModal>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
                  <EvidenceTitle>Evidence bundle — {entry.id}</EvidenceTitle>
                  <div style={{display:'flex',gap:'.5rem'}}>
                    <Button $variant="secondary" $size="sm">↓ PDF</Button>
                    <Button $variant="secondary" $size="sm">↓ JSON</Button>
                  </div>
                </div>
                {Object.entries(entry.evidence).map(([k,v])=>(
                  <EvidenceRow key={k}>
                    <EvidenceLabel>{k.replace(/([A-Z])/g,' $1').toLowerCase()}</EvidenceLabel>
                    <EvidenceValue>{String(v)}</EvidenceValue>
                  </EvidenceRow>
                ))}
                <p style={{fontSize:'.6875rem',color:'#A0AEC0',margin:'.75rem 0 0',textAlign:'center'}}>
                  ⚠ This evidence package is cryptographically signed and cannot be altered
                </p>
              </EvidenceModal>
            )}
          </div>
        ))}
      </Card>
    </PageLayout>
  );
};

export default AuditPage;
