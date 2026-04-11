import React, { useState } from 'react';
import styled from 'styled-components';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge, StageBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TableWrapper, Table, Thead, Th, Tbody, Tr, Td, TdMuted } from '../../components/ui/Table';
import ApplicationDetail from './ApplicationDetail';
import queueData from '../../data/hitlQueue.json';

const DYNAMIC = 'Queue populated by AI decisioning engine — GET /api/v1/applications?status=pending_review';

const FilterRow = styled.div`
  display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1.25rem;align-items:center;
`;
const FilterBtn = styled.button<{$active:boolean}>`
  padding:.375rem .875rem;border-radius:20px;font-size:.8125rem;font-weight:500;
  border:.5px solid ${({$active})=>$active?'#0C2B5E':'#E2E8F0'};
  background:${({$active})=>$active?'#0C2B5E':'#fff'};
  color:${({$active})=>$active?'#fff':'#718096'};
  cursor:pointer;transition:all .15s;
  &:hover{border-color:#0C2B5E;color:#0C2B5E;background:${({$active})=>$active?'#0C2B5E':'#EBF4FF'};}
`;
const CompanyCell = styled.div``;
const CompanyName = styled.p`font-size:.875rem;font-weight:500;color:#2D3748;margin:0;`;
const AppId = styled.p`font-size:.75rem;color:#A0AEC0;margin:0;font-family:'IBM Plex Mono',monospace;`;
const GradeTag = styled.span<{$grade:string}>`
  font-size:.8125rem;font-weight:700;font-family:'IBM Plex Mono',monospace;
  color:${({$grade})=>
    $grade.startsWith('A')?'#0F6E56':
    $grade.startsWith('B')?'#185FA5':
    $grade.startsWith('C')?'#854F0B':'#A32D2D'};
`;
const ScoreFill = styled.div<{$v:number}>`
  height:4px;width:56px;background:#E2E8F0;border-radius:2px;overflow:hidden;
  &::after{content:'';display:block;height:100%;width:${({$v})=>Math.min($v*100/20,100)}%;
  background:${({$v})=>$v<5?'#1D9E75':$v<12?'#BA7517':'#E24B4A'};border-radius:2px;}
`;
const PdRow = styled.div`display:flex;align-items:center;gap:.5rem;`;
const PdNum = styled.span`font-size:.8125rem;font-weight:500;`;

const QueuePage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<string|null>(null);

  const apps = queueData.applications;
  const filtered = filter === 'all' ? apps
    : filter === 'hitl' ? apps.filter(a=>a.hitlRequired)
    : apps.filter(a=>a.status.toLowerCase().includes(filter));

  if (selected) {
    const app = apps.find(a=>a.id===selected);
    if (app) return <ApplicationDetail app={app as any} onBack={()=>setSelected(null)} />;
  }

  return (
    <PageLayout title="HITL Queue" notifCount={2}>
      <p style={{fontSize:'.75rem',color:'#A0AEC0',marginBottom:'1rem',fontStyle:'italic'}}>{DYNAMIC}</p>

      <FilterRow>
        {[
          {key:'all',label:`All (${apps.length})`},
          {key:'hitl',label:`HITL required (${apps.filter(a=>a.hitlRequired).length})`},
          {key:'approved',label:'Approved'},
          {key:'flagged',label:'Flagged'},
        ].map(f=>(
          <FilterBtn key={f.key} $active={filter===f.key} onClick={()=>setFilter(f.key)}>
            {f.label}
          </FilterBtn>
        ))}
      </FilterRow>

      <Card $padding="sm">
        <CardHeader>
          <CardTitle>Credit applications</CardTitle>
          <Badge $variant="info">{filtered.length} applications</Badge>
        </CardHeader>
        <CardDivider />
        <TableWrapper>
          <Table>
            <Thead>
              <tr>
                <Th>Company</Th>
                <Th>Amount</Th>
                <Th>Grade</Th>
                <Th>PD</Th>
                <Th>DSCR</Th>
                <Th>Status</Th>
                <Th>IFRS Stage</Th>
                <Th></Th>
              </tr>
            </Thead>
            <Tbody>
              {filtered.map(a=>(
                <Tr key={a.id} style={{cursor:'pointer'}} onClick={()=>setSelected(a.id)}>
                  <Td>
                    <CompanyCell>
                      <CompanyName>{a.company}</CompanyName>
                      <AppId>{a.id} · {a.sector}</AppId>
                    </CompanyCell>
                  </Td>
                  <Td style={{fontWeight:500}}>€{(a.amount/1000).toFixed(0)}K</Td>
                  <Td><GradeTag $grade={a.grade}>{a.grade}</GradeTag></Td>
                  <Td>
                    <PdRow>
                      <ScoreFill $v={a.pd} />
                      <PdNum>{a.pd}%</PdNum>
                    </PdRow>
                  </Td>
                  <Td style={{fontWeight:500,color:a.dscr>=1.2?'#0F6E56':'#A32D2D'}}>
                    {a.dscr}×
                  </Td>
                  <Td>
                    <Badge $variant={a.statusVariant as any} $dot>
                      {a.status}
                    </Badge>
                    {a.hitlRequired && (
                      <Badge $variant="warning" $size="sm" style={{marginLeft:'4px'}}>HITL</Badge>
                    )}
                  </Td>
                  <Td>
                    <StageBadge $variant="neutral" $stage={a.ifrs9.stage as 1|2|3} $size="sm">
                      Stage {a.ifrs9.stage}
                    </StageBadge>
                  </Td>
                  <Td>
                    <Button $variant="secondary" $size="sm" onClick={e=>{e.stopPropagation();setSelected(a.id);}}>
                      Review →
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableWrapper>
      </Card>
    </PageLayout>
  );
};

export default QueuePage;
