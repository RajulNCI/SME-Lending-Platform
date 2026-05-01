import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { getBorrowerApplications, type BorrowerApplication } from '../../services/AIApi';


const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  th { text-align: left; padding: 0.75rem; border-bottom: 1px solid #E2E8F0; color: #4A5568; font-size: 0.875rem; }
  td { padding: 0.75rem; border-bottom: 1px solid #E2E8F0; color: #2D3748; font-size: 0.875rem; }
`;


const BorrowerPage: React.FC = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<BorrowerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const data = await getBorrowerApplications();
        setApps(data);
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  return (
    <PageLayout title="My Applications">
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '.75rem',
          }}
        >
          <p style={{ fontSize: '.9375rem', color: '#718096', margin: 0 }}>
            Track your loan applications and decision status
          </p>
          <Button
            $variant="primary"
            onClick={() => navigate('/borrower/apply')}
          >
            + New application
          </Button>
        </div>

        <Card $padding="md">
          
          <CardTitle>Application status</CardTitle>
          <CardDivider />
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>Loading applications...</div>
          ) : apps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <p style={{ fontSize: '2rem', margin: '0 0 .75rem' }}>📋</p>
              <p style={{ fontWeight: 600, color: '#0C2B5E', margin: '0 0 .5rem' }}>
                No applications yet
              </p>
              <p style={{ fontSize: '.875rem', color: '#718096', margin: '0 0 1.25rem' }}>
                Submit your first application to get started.
                <br />
                Our AI engine will analyse your documents within minutes.
              </p>
              <Button
                $variant="primary"
                onClick={() => navigate('/borrower/apply')}
              >
                Start application →
              </Button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
                <Table>
                    <thead>
                        <tr>
                            <th>Reference</th>
                            <th>Amount</th>
                            <th>Purpose</th>
                            <th>Status</th>
                            <th>Submitted</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apps.map(a => (
                            <tr key={a.id}>
                                <td style={{ fontFamily: 'monospace' }}>{a.reference}</td>
                                <td>€{a.loan_amount.toLocaleString()}</td>
                                <td>{a.loan_purpose}</td>
                                <td><Badge $variant={a.status === 'approved' ? 'success' : a.status === 'declined' ? 'error' : 'warning'}>{a.status}</Badge></td>
                                <td>{new Date(a.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
          )}

        </Card>

        <Card
          $padding="md"
          style={{ marginTop: '1rem' }}
        >
          <CardTitle>Your rights under GDPR Article 22</CardTitle>
          <CardDivider />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
            {[
              {
                icon: '📄',
                title: 'Right to explanation',
                desc: 'You can request a plain-language explanation of any automated credit decision',
              },
              {
                icon: '👤',
                title: 'Right to human review',
                desc: 'You can request a Credit Officer reviews any automated decision',
              },
              {
                icon: '📢',
                title: 'Right to appeal',
                desc: 'You can appeal any adverse decision — response within 30 days',
              },
            ].map((r) => (
              <div
                key={r.title}
                style={{
                  display: 'flex',
                  gap: '.75rem',
                  padding: '.875rem',
                  background: '#F0F7FF',
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{r.icon}</span>
                <div>
                  <p
                    style={{
                      fontWeight: 500,
                      color: '#0C2B5E',
                      margin: '0 0 .25rem',
                      fontSize: '.875rem',
                    }}
                  >
                    {r.title}
                  </p>
                  <p style={{ fontSize: '.8125rem', color: '#4A5568', margin: 0 }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default BorrowerPage;
