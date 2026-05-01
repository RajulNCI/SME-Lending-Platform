import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueueData } from '../../hooks/useQueueData';
import styles from '../../styles/queue.module.css';
import ApplicationDetail from '../../features/queue/ApplicationDetail';
import { MOCK_APPS_DATA } from '../../data/mockQueueDetails';

const QueuePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { apps, handleDecision } = useQueueData();
  
  const [filter, setFilter] = useState('all');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const initials =
    user?.displayName
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase() || 'CO';

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

  // Helper to enrich dynamic apps with rich static data template
  const getEnrichedApps = () => {
    const template = MOCK_APPS_DATA[0]; // Use O'Brien as the base template for rich data
    
    return apps.map(dynamicApp => {
      // Find if we already have a static match (e.g. if we kept static seeded apps)
      const staticMatch = MOCK_APPS_DATA.find(a => a.id === dynamicApp.applicationId);
      
      const baseApp = staticMatch || template;
      
      return {
        ...baseApp,
        id: dynamicApp.applicationId,
        company: dynamicApp.company || baseApp.company,
        amount: `€${(dynamicApp.requestedAmount || 0).toLocaleString()}`,
        requestedAmount: dynamicApp.requestedAmount,
        status: dynamicApp.status,
        sector: dynamicApp.sector || baseApp.sector,
        hitl: dynamicApp.hitl || baseApp.hitl,
        decision: dynamicApp.officerDecision || null
      };
    });
  };

  const enrichedApps = getEnrichedApps();

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

  const selectedApp = selectedAppId ? enrichedApps.find(a => a.id === selectedAppId) : null;

  return (
    <div className={styles.app}>
      {/* SIDEBAR */}
      <nav className={styles.sidebar}>
        <div className={styles.sbLogo}>
          <div className={styles.sbMark}>F</div>
          <div>
            <div className={styles.sbName}>FinPal</div>
            <div className={styles.sbTag}>v5.0 · TRUSTWORTHY AI</div>
          </div>
        </div>
        <div className={styles.sbSection}>
          <div className={styles.sbLbl}>Platform</div>
          <button className={styles.sbItem}><span className={styles.sbIcon}>↑</span> Intake Pipeline</button>
          <button className={`${styles.sbItem} ${styles.sbItemActive}`} onClick={() => setSelectedAppId(null)}>
            <span className={styles.sbIcon}>☰</span> Queue <span className={styles.sbBadge}>{pendingCount}</span>
          </button>
          <button className={styles.sbItem}><span className={styles.sbIcon}>◧</span> Audit Trail</button>
        </div>
        <div className={styles.sbSection}>
          <div className={styles.sbLbl}>Risk & Compliance</div>
          <button className={styles.sbItem}><span className={styles.sbIcon}>⚙</span> Model Governance</button>
          <button className={styles.sbItem}><span className={styles.sbIcon}>▦</span> Portfolio Risk</button>
        </div>
        <div className={styles.sbUser}>
          <div className={styles.avi}>{initials}</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13, fontWeight:500, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {user?.displayName || 'C. Officer'}
            </div>
            <div style={{fontSize:10, color:'rgba(255,255,255,.5)', fontFamily:'var(--font-mono)'}}>
              Credit Officer · IAF PCF-11
            </div>
          </div>
          <button onClick={logout} style={{background:'none', border:'none', color:'rgba(255,255,255,.5)', cursor:'pointer'}}>↪</button>
        </div>
      </nav>

      {/* MAIN */}
      <div className={styles.main}>
        {/* TOPBAR */}
        <div className={styles.topbar}>
          <div className={styles.tbTitle}>Loan Intake & Assessment</div>
          <div className={styles.tbRight}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => showToast('+ New Application modal')}>+ New Application</button>
            <button className={`${styles.btn} ${styles.btnOutline}`} style={{fontSize:12}}>✏ Tests</button>
            <button className={`${styles.btn} ${styles.btnOutline}`} style={{fontSize:12}} onClick={logout}>→ Log Out</button>
            <div className={styles.tbUser}>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:13, fontWeight:500, color:'var(--navy)'}}>{user?.displayName || 'C. Officer'}</div>
                <div style={{fontSize:10, color:'var(--muted)', fontFamily:'var(--font-mono)'}}>Credit Officer · IAF PCF-11</div>
              </div>
              <div className={styles.aviLg}>{initials}</div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          
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
                      onClick={() => setSelectedAppId(app.id)}
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
          )}

          {/* APP DETAIL VIEW */}
          {selectedAppId && selectedApp && (
            <ApplicationDetail 
              app={selectedApp} 
              onBack={() => setSelectedAppId(null)}
              onDecision={onDecision}
              submittedDecision={submitted[selectedApp.id] || selectedApp.decision}
              showToast={showToast}
            />
          )}

        </div>
      </div>
      
      {/* TOAST */}
      {toastMsg && (
        <div className={styles.toast}>
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default QueuePage;
