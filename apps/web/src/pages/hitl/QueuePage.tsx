import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueueData } from '../../hooks/useQueueData';
import styles from '../../styles/queue.module.css';
import ApplicationDetail from '../../features/queue/ApplicationDetail';
import { MOCK_APPS_DATA } from '../../data/mockQueueDetails';
import PageLayout from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { getApplicationDetail } from '../../services/AIApi';
import type { AppDetail } from '../../features/queue/types';

const QueuePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { apps, handleDecision } = useQueueData();
  
  const [filter, setFilter] = useState('all');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedAppDetail, setSelectedAppDetail] = useState<AppDetail | null>(null);
  const [submitted, setSubmitted] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const onDecision = async (appId: string, decision: 'approved' | 'referred' | 'declined', rationale: string) => {
    const success = await handleDecision(appId, decision, rationale, user?.displayName || 'Underwriter');
    if (success) {
      setSubmitted((p) => ({ ...p, [appId]: decision }));
      showToast(`✓ Decision: ${decision.toUpperCase()} — logged to immutable audit trail · EU AI Act Art.12`);
    }
  };

  const enrichedApps = apps.map(a => ({
    ...a,
    id: a.applicationId,
    decision: a.officerDecision || null,
  }));

  const openApp = async (appId: string) => {
    setSelectedAppId(appId);
    setSelectedAppDetail(null);
    try {
      const raw = await getApplicationDetail(appId);
      const shapCodes: import('../../features/queue/types').ShapValue[] = (raw.shap_codes || []).map((s: any) => ({
        feature: s.feature,
        value: s.weight ?? s.value ?? 0,
        direction: (s.direction === 'reduces_risk' ? 'positive' : 'negative') as 'positive' | 'negative',
      }));
      const detail: AppDetail = {
        id: raw.id,
        company: raw.company_name || 'Unknown',
        crn: raw.crn,
        sector: raw.sector || 'N/A',
        amount: `€${parseFloat(String(raw.loan_amount ?? raw.loanAmount ?? 0)).toLocaleString()}`,
        loanType: raw.loan_purpose || 'N/A',
        status: raw.status,
        hitl: raw.status === 'hitl_queue',
        hitlReason: raw.status === 'hitl_queue' ? 'Awaiting officer review' : undefined,
        pd: raw.pd,
        riskGrade: raw.risk_grade,
        dscr: raw.dscr,
        apr: raw.apr,
        affordability: raw.affordability,
        lgd: raw.lgd,
        ead: raw.ead,
        ecl12m: raw.ecl_12m,
        eclLifetime: raw.ecl_lifetime,
        eclStage: raw.ifrs9_stage as 1 | 2 | 3 | undefined,
        narrative: raw.narrative,
        shapValues: shapCodes,
        checks: raw.checks || [],
        bars: raw.bars || [],
        fairnessMetrics: raw.fairness_metrics,
        discrepancy: raw.discrepancy,
        discrepancyDetail: raw.discrepancy_detail,
        revenue: raw.annual_revenue != null ? `€${parseFloat(String(raw.annual_revenue)).toLocaleString()}` : undefined,
        revenueActual: raw.revenue_actual != null ? `€${parseFloat(String(raw.revenue_actual)).toLocaleString()}` : undefined,
        cashflow: raw.free_cash_flow != null ? `€${parseFloat(String(raw.free_cash_flow)).toLocaleString()}` : undefined,
      };
      setSelectedAppDetail(detail);
    } catch (err) {
      console.error('Failed to load app detail', err);
    }
  };

  const filteredApps = enrichedApps.filter((app) => {
    if (filter === 'all') return true;
    if (filter === 'review') return app.hitl || app.status === 'flagged';
    if (filter === 'approve') return (app.recommendation || '').toLowerCase().includes('approv');
    if (filter === 'decline') return (app.recommendation || '').toLowerCase().includes('declin');
    return true;
  });

  const pendingCount = enrichedApps.filter(a => !submitted[a.id] && a.status !== 'decided' && a.decision === null).length;

  const priority = (app: any) => {
    if (submitted[app.id] || app.status === 'decided' || app.decision) return 'done';
    if (app.status === 'flagged') return 'high';
    if (app.hitl) return 'hitl';
    if (app.status === 'waiting_officer') return 'med';
    return 'proc';
  };

  const bClass = (p: string) => {
    switch(p) {
      case 'high': return styles.bHigh;
      case 'hitl': return styles.bHitl;
      case 'med': return styles.bMed;
      case 'proc': return styles.bProc;
      case 'done': return styles.bDone;
      default: return '';
    }
  };

  const pdColor = (v: number | null | undefined) => {
    if (v == null) return 'var(--muted)';
    if (v < 0.05) return 'var(--teal)';
    if (v < 0.10) return '#D97706';
    return '#DC2626';
  };

  const dscrColor = (d: number | null | undefined) => {
    if (d == null) return 'var(--muted)';
    return d >= 1.2 ? '#059669' : '#DC2626';
  };

  const gClass = (g: string) => {
    if (!g) return '';
    if (g.startsWith('A')) return styles.gA;
    if (g.startsWith('B')) return styles.gB;
    return styles.gC;
  };

  const selectedApp = selectedAppDetail;

  return (
    <>
      <PageLayout 
        title="Loan Intake & Assessment"
        notifCount={pendingCount}
        actions={
          <>
            <Button $variant="primary" $size="sm" onClick={() => showToast('+ New Application modal')}>+ New Application</Button>
            <Button $variant="ghost" $size="sm" style={{fontSize:12}}>✏ Tests</Button>
          </>
        }
      >
          {/* QUEUE VIEW */}
          {!selectedAppId && (
            <div className={styles.queueView}>
              <div className={styles.qHdr}>
                <div>
                  <div className={styles.qTitle}>Credit Assessment Queue</div>
                  <div className={styles.qSub}>
                    <span className={styles.liveDot}></span>
                    <span>{enrichedApps.length} applications · {pendingCount} awaiting decision</span>
                  </div>
                </div>
              </div>
              <div className={styles.filters}>
                {[
                  { k: 'all', l: `All (${enrichedApps.length})` },
                  { k: 'review', l: `Needs review (${enrichedApps.filter(a => a.hitl || a.status === 'flagged').length})` },
                  { k: 'approve', l: 'Recommend approve' },
                  { k: 'decline', l: 'Recommend decline' },
                ].map(f => (
                  <button 
                    key={f.k} 
                    className={`${styles.fBtn} ${filter === f.k ? styles.fBtnActive : ''}`} 
                    onClick={() => setFilter(f.k)}
                  >
                    {f.l}
                  </button>
                ))}
              </div>
              
              <div className={styles.qTableWrapper}>
                <div className={styles.qTable}>
                  <div className={styles.qThead}>
                    <div className={styles.qTh}>Priority</div>
                    <div className={styles.qTh}>Company / Sector</div>
                    <div className={styles.qTh}>Amount</div>
                    <div className={styles.qTh}>Grade</div>
                    <div className={styles.qTh}>PD</div>
                    <div className={styles.qTh}>Status</div>
                    <div className={styles.qTh}>DSCR</div>
                    <div className={styles.qTh}></div>
                  </div>
                
                {filteredApps.map(app => {
                  const p = priority(app);
                  const dec = submitted[app.id] || app.decision;
                  let statusLabel = 'Processing…';
                  if (dec) statusLabel = `✓ ${dec}`;
                  else if (app.hitl) statusLabel = '⚠ HITL required';
                  else if (app.status === 'flagged') statusLabel = '⚠ Flagged';
                  else if (app.status === 'waiting_officer') statusLabel = 'Ready to review';
                  return (
                    <div 
                      key={app.id} 
                      className={`${styles.qRow} ${app.status === 'flagged' ? styles.qRowFlagged : ''}`} 
                      onClick={() => openApp(app.id)}
                    >
                      <div className={styles.qTd}>
                        <span className={`${styles.badge} ${bClass(p)}`}>
                          {dec ? 'DONE' : p === 'high' ? 'FLAGGED' : p === 'hitl' ? 'HITL' : p === 'med' ? 'REVIEW' : p === 'proc' ? 'IN PROGRESS' : 'DONE'}
                        </span>
                      </div>
                      <div className={styles.qTd}>
                        <div>
                          <div className={styles.coName}>{app.company}</div>
                          <div className={styles.coMeta}>{app.id} · {app.sector}</div>
                        </div>
                      </div>
                      <div className={styles.qTd} style={{fontFamily: 'var(--font-mono)'}}>{app.amount}</div>
                      <div className={styles.qTd}>
                        {app.riskGrade ? <span className={gClass(app.riskGrade)}>{app.riskGrade}</span> : <span style={{color: 'var(--muted)'}}>—</span>}
                      </div>
                      <div className={styles.qTd} style={{fontFamily: 'var(--font-mono)', color: pdColor(app.pd)}}>
                        {app.pd != null ? `${(app.pd * 100).toFixed(1)}%` : '—'}
                      </div>
                      <div className={styles.qTd}>
                        <span className={`${styles.badge} ${bClass(p)}`} style={{whiteSpace: 'normal'}}>{statusLabel}</span>
                      </div>
                      <div className={styles.qTd} style={{fontFamily: 'var(--font-mono)', color: dscrColor(app.dscr)}}>
                        {app.dscr != null ? `${app.dscr.toFixed(2)}×` : '—'}
                      </div>
                      <div className={styles.qTd}>
                        <span style={{fontSize: 11, color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontWeight: 600}}>Open →</span>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          )}

          {/* APP DETAIL VIEW */}
          {selectedAppId && !selectedApp && (
            <div style={{ padding: '2rem', color: 'var(--muted)', textAlign: 'center' }}>
              Loading application details…
            </div>
          )}
          {selectedAppId && selectedApp && (
            <ApplicationDetail
              app={selectedApp}
              onBack={() => { setSelectedAppId(null); setSelectedAppDetail(null); }}
              onDecision={onDecision}
              submittedDecision={submitted[selectedApp.id] || null}
              showToast={showToast}
            />
          )}

      </PageLayout>
      
      {/* TOAST */}
      {toastMsg && (
        <div className={styles.toast}>
          {toastMsg}
        </div>
      )}
    </>
  );
};

export default QueuePage;
