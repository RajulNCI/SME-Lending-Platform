import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ROLE_HOME } from './types/auth';
import type { UserRole } from './types/auth';

import LoginPage from './pages/auth/LoginPage';
import IntakePage from './pages/intake/IntakePage';
import QueuePage from './pages/hitl/QueuePage';
import AuditPage from './pages/audit/AuditPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import RiskPage from './pages/risk/RiskPage';
import CollectionsPage from './pages/collections/CollectionsPage';
import MrmPage from './pages/mrm/MrmPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import BorrowerPage from './pages/borrower/BorrowerPage';
import BorrowerApplyPage from './pages/borrower/BorrowerApplyPage';
import PageLayout from './components/layout/PageLayout';

const Soon: React.FC<{ title: string }> = ({ title }) => (
  <PageLayout title={title}>
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <p style={{ fontSize: '2rem', margin: '0 0 .75rem' }}>🚧</p>
      <h2 style={{ color: '#0C2B5E', fontFamily: "'Inter',sans-serif", margin: '0 0 .5rem' }}>
        {title}
      </h2>
      <p style={{ color: '#718096', fontSize: '.9375rem' }}>This screen is being built.</p>
    </div>
  </PageLayout>
);

const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  return <>{children}</>;
};

/**
 * RoleGuard — accepts both Cognito roles (CREDIT_OFFICER) and legacy roles (credit_officer).
 * Maps legacy roles to Cognito roles for comparison.
 */
const RoleGuard: React.FC<{ children: React.ReactNode; roles: (UserRole | string)[] }> = ({
  children,
  roles,
}) => {
  const { user } = useAuth();
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
      />
    );

  // Normalize: accept both CREDIT_OFFICER and credit_officer formats
  const normalizedRoles = roles.map((r) => r.toUpperCase().replace(/\./g, '_'));
  const userRole = user.role.toUpperCase();

  if (!normalizedRoles.includes(userRole)) {
    // Also check if the role grants access via broader permissions
    // ADMIN has access everywhere, SENIOR_CREDIT_OFFICER has CREDIT_OFFICER access
    const expandedRoles = new Set(normalizedRoles);
    if (expandedRoles.has('CREDIT_OFFICER')) expandedRoles.add('SENIOR_CREDIT_OFFICER');
    if (expandedRoles.has('BRANCH_MANAGER')) expandedRoles.add('ADMIN');

    if (!expandedRoles.has(userRole) && userRole !== 'ADMIN') {
      return (
        <Navigate
          to={ROLE_HOME[user.role] || '/dashboard'}
          replace
        />
      );
    }
  }

  return <>{children}</>;
};

const DefaultRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  return (
    <Navigate
      to={ROLE_HOME[user.role] || '/dashboard'}
      replace
    />
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={<LoginPage />}
          />

          {/* Credit Officer — sees queue after AI processes borrower's docs */}
          <Route
            path="/intake"
            element={
              <RoleGuard roles={['CREDIT_OFFICER', 'SENIOR_CREDIT_OFFICER', 'BRANCH_MANAGER', 'ADMIN']}>
                <IntakePage />
              </RoleGuard>
            }
          />
          <Route
            path="/queue"
            element={
              <RoleGuard
                roles={['CREDIT_OFFICER', 'SENIOR_CREDIT_OFFICER', 'BRANCH_MANAGER', 'ADMIN', 'COMPLIANCE_OFFICER']}
              >
                <QueuePage />
              </RoleGuard>
            }
          />

          {/* Compliance */}
          <Route
            path="/audit"
            element={
              <RoleGuard roles={['COMPLIANCE_OFFICER', 'ADMIN', 'AUDITOR', 'CREDIT_OFFICER']}>
                <AuditPage />
              </RoleGuard>
            }
          />
          <Route
            path="/ccr"
            element={
              <RoleGuard roles={['COMPLIANCE_OFFICER', 'ADMIN']}>
                <Soon title="CCR / AnaCredit" />
              </RoleGuard>
            }
          />
          <Route
            path="/gdpr"
            element={
              <RoleGuard roles={['COMPLIANCE_OFFICER', 'ADMIN']}>
                <Soon title="GDPR Requests" />
              </RoleGuard>
            }
          />

          {/* Ops */}
          <Route
            path="/dashboard"
            element={
              <RoleGuard roles={['BRANCH_MANAGER', 'ADMIN']}>
                <DashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/payments"
            element={
              <RoleGuard roles={['BRANCH_MANAGER', 'ADMIN']}>
                <Soon title="SEPA Payments" />
              </RoleGuard>
            }
          />
          <Route
            path="/mandates"
            element={
              <RoleGuard roles={['BRANCH_MANAGER', 'ADMIN']}>
                <Soon title="SDD Mandates" />
              </RoleGuard>
            }
          />
          <Route
            path="/sla"
            element={
              <RoleGuard roles={['BRANCH_MANAGER', 'ADMIN']}>
                <Soon title="SLA Monitor" />
              </RoleGuard>
            }
          />

          {/* Risk */}
          <Route
            path="/risk"
            element={
              <RoleGuard roles={['RISK_ANALYST', 'ADMIN']}>
                <RiskPage />
              </RoleGuard>
            }
          />
          <Route
            path="/risk/models"
            element={
              <RoleGuard roles={['RISK_ANALYST', 'ADMIN']}>
                <RiskPage />
              </RoleGuard>
            }
          />
          <Route
            path="/risk/stress"
            element={
              <RoleGuard roles={['RISK_ANALYST', 'ADMIN']}>
                <RiskPage />
              </RoleGuard>
            }
          />
          <Route
            path="/risk/ewi"
            element={
              <RoleGuard roles={['RISK_ANALYST', 'ADMIN']}>
                <Soon title="Early Warning Indicators" />
              </RoleGuard>
            }
          />

          {/* MRM */}
          <Route
            path="/mrm"
            element={
              <RoleGuard roles={['RISK_ANALYST', 'ADMIN']}>
                <MrmPage />
              </RoleGuard>
            }
          />
          <Route
            path="/mrm/metrics"
            element={
              <RoleGuard roles={['RISK_ANALYST', 'ADMIN']}>
                <MrmPage />
              </RoleGuard>
            }
          />
          <Route
            path="/mrm/drift"
            element={
              <RoleGuard roles={['RISK_ANALYST', 'ADMIN']}>
                <MrmPage />
              </RoleGuard>
            }
          />
          <Route
            path="/mrm/challenger"
            element={
              <RoleGuard roles={['RISK_ANALYST', 'ADMIN']}>
                <Soon title="Champion-Challenger" />
              </RoleGuard>
            }
          />

          {/* Collections */}
          <Route
            path="/collections"
            element={
              <RoleGuard roles={['BRANCH_MANAGER', 'ADMIN']}>
                <CollectionsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/bureau"
            element={
              <RoleGuard roles={['BRANCH_MANAGER', 'ADMIN']}>
                <Soon title="Credit Bureau Reporting" />
              </RoleGuard>
            }
          />

          {/* IT Admin */}
          <Route
            path="/admin/users"
            element={
              <RoleGuard roles={['ADMIN']}>
                <AdminUsersPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/dora"
            element={
              <RoleGuard roles={['ADMIN']}>
                <Soon title="DORA Resilience" />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/api"
            element={
              <RoleGuard roles={['ADMIN']}>
                <Soon title="API Management" />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/tprm"
            element={
              <RoleGuard roles={['ADMIN']}>
                <Soon title="TPRM Register" />
              </RoleGuard>
            }
          />

          {/* Borrower — uploads docs, submits application, waits for decision */}
          <Route
            path="/borrower"
            element={
              <RoleGuard roles={['BORROWER']}>
                <BorrowerPage />
              </RoleGuard>
            }
          />
          <Route
            path="/borrower/apply"
            element={
              <RoleGuard roles={['BORROWER']}>
                <BorrowerApplyPage />
              </RoleGuard>
            }
          />
          <Route
            path="/borrower/messages"
            element={
              <RoleGuard roles={['BORROWER']}>
                <Soon title="Messages" />
              </RoleGuard>
            }
          />

          {/* Shared */}
          <Route
            path="/settings"
            element={
              <Protected>
                <Soon title="Settings" />
              </Protected>
            }
          />
          <Route
            path="/"
            element={<DefaultRedirect />}
          />
          <Route
            path="*"
            element={<DefaultRedirect />}
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </AuthProvider>
);

export default App;
