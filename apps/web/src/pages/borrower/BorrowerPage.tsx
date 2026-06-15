import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { getBorrowerApplications, type BorrowerApplication } from '../../services/AIApi';

import { TableWrapper, Table, Thead, Th, Tbody, Tr, Td } from '../../components/ui/Table';
import {
  PageHeader,
  HeaderSubtitle,
  EmptyStateContainer,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  RightsList,
  RightItem,
  RightIcon,
  RightTitle,
  RightDescription,
} from '../../styles/pages/BorrowerPage.styles';

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
        <PageHeader>
          <HeaderSubtitle>
            Track your loan applications and decision status
          </HeaderSubtitle>
          <Button
            $variant="primary"
            onClick={() => navigate('/borrower/apply')}
          >
            + New application
          </Button>
        </PageHeader>

        <Card $padding="md">
          
          <CardTitle>Application status</CardTitle>
          <CardDivider />
          
          {loading ? (
            <EmptyStateContainer>Loading applications...</EmptyStateContainer>
          ) : apps.length === 0 ? (
            <EmptyStateContainer>
              <EmptyStateIcon>📋</EmptyStateIcon>
              <EmptyStateTitle>
                No applications yet
              </EmptyStateTitle>
              <EmptyStateDescription>
                Submit your first application to get started.
                <br />
                Our AI engine will analyse your documents within minutes.
              </EmptyStateDescription>
              <Button
                $variant="primary"
                onClick={() => navigate('/borrower/apply')}
              >
                Start application →
              </Button>
            </EmptyStateContainer>
          ) : (
            <TableWrapper>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>Reference</Th>
                            <Th>Amount</Th>
                            <Th>Purpose</Th>
                            <Th>Status</Th>
                            <Th>Submitted</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {apps.map(a => {
                            const companyName = a.company_name || 'Unknown';
                            const loanAmount = a.loan_amount || 0;
                            const loanPurpose = a.loan_purpose || 'N/A';
                            const createdAt = a.created_at || '';
                            const status = (a.status || 'SUBMITTED').toLowerCase();
                            const reference = a.reference || a.id;
                            return (
                            <Tr key={a.id}>
                                <Td style={{ fontFamily: 'monospace' }}>{reference}</Td>
                                <Td>€{Number(loanAmount).toLocaleString()}</Td>
                                <Td>{loanPurpose}</Td>
                                <Td><Badge $variant={status === 'approved' ? 'success' : status === 'declined' || status === 'failed' ? 'error' : 'warning'}>{a.status}</Badge></Td>
                                <Td>{createdAt ? new Date(createdAt).toLocaleDateString() : '—'}</Td>
                            </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </TableWrapper>
          )}

        </Card>

        <Card
          $padding="md"
          style={{ marginTop: '1rem' }}
        >
          <CardTitle>Your rights under GDPR Article 22</CardTitle>
          <CardDivider />
          <RightsList>
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
              <RightItem key={r.title}>
                <RightIcon>{r.icon}</RightIcon>
                <div>
                  <RightTitle>{r.title}</RightTitle>
                  <RightDescription>{r.desc}</RightDescription>
                </div>
              </RightItem>
            ))}
          </RightsList>
        </Card>
      </div>
    </PageLayout>
  );
};

export default BorrowerPage;
