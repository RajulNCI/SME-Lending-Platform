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
 * RoleGuard — checks if the current user's role is in the allowed list.
 * Uses case-insensitive comparison to handle both formats.
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

  // Normalize to lowercase for comparison
  const normalizedRoles = roles.map((r) => r.toLowerCase());
  const userRole = user.role.toLowerCase();

  if (!normalizedRoles.includes(userRole)) {
    // it_admin has access everywhere
    if (userRole === 'it_admin') {
      return <>{children}</>;
    }
    return (
      <Navigate
        to={ROLE_HOME[user.role] || '/dashboard'}
        replace
      />
    );
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
              <RoleGuard roles={['credit_officer', 'ops_manager', 'it_admin']}>
                <IntakePage />
              </RoleGuard>
            }
          />
          <Route
            path="/queue"
            element={
              <RoleGuard
                roles={['credit_officer', 'ops_manager', 'it_admin', 'compliance_officer']}
              >
                <QueuePage />
              </RoleGuard>
            }
          />

          {/* Compliance */}
          <Route
            path="/audit"
            element={
              <RoleGuard roles={['compliance_officer', 'it_admin', 'credit_officer']}>
                <AuditPage />
              </RoleGuard>
            }
          />
          <Route
            path="/ccr"
            element={
              <RoleGuard roles={['compliance_officer', 'it_admin']}>
                <Soon title="CCR / AnaCredit" />
              </RoleGuard>
            }
          />
          <Route
            path="/gdpr"
            element={
              <RoleGuard roles={['compliance_officer', 'it_admin']}>
                <Soon title="GDPR Requests" />
              </RoleGuard>
            }
          />

          {/* Ops */}
          <Route
            path="/dashboard"
            element={
              <RoleGuard roles={['ops_manager', 'it_admin']}>
                <DashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/payments"
            element={
              <RoleGuard roles={['ops_manager', 'it_admin']}>
                <Soon title="SEPA Payments" />
              </RoleGuard>
            }
          />
          <Route
            path="/mandates"
            element={
              <RoleGuard roles={['ops_manager', 'collections_officer', 'it_admin']}>
                <Soon title="SDD Mandates" />
              </RoleGuard>
            }
          />
          <Route
            path="/sla"
            element={
              <RoleGuard roles={['ops_manager', 'it_admin']}>
                <Soon title="SLA Monitor" />
              </RoleGuard>
            }
          />

          {/* Risk */}
          <Route
            path="/risk"
            element={
              <RoleGuard roles={['risk_manager', 'it_admin']}>
                <RiskPage />
              </RoleGuard>
            }
          />
          <Route
            path="/risk/models"
            element={
              <RoleGuard roles={['risk_manager', 'it_admin']}>
                <RiskPage />
              </RoleGuard>
            }
          />
          <Route
            path="/risk/stress"
            element={
              <RoleGuard roles={['risk_manager', 'it_admin']}>
                <RiskPage />
              </RoleGuard>
            }
          />
          <Route
            path="/risk/ewi"
            element={
              <RoleGuard roles={['risk_manager', 'it_admin']}>
                <Soon title="Early Warning Indicators" />
              </RoleGuard>
            }
          />

          {/* MRM */}
          <Route
            path="/mrm"
            element={
              <RoleGuard roles={['mrm_analyst', 'risk_manager', 'it_admin']}>
                <MrmPage />
              </RoleGuard>
            }
          />
          <Route
            path="/mrm/metrics"
            element={
              <RoleGuard roles={['mrm_analyst', 'risk_manager', 'it_admin']}>
                <MrmPage />
              </RoleGuard>
            }
          />
          <Route
            path="/mrm/drift"
            element={
              <RoleGuard roles={['mrm_analyst', 'risk_manager', 'it_admin']}>
                <MrmPage />
              </RoleGuard>
            }
          />
          <Route
            path="/mrm/challenger"
            element={
              <RoleGuard roles={['mrm_analyst', 'risk_manager', 'it_admin']}>
                <Soon title="Champion-Challenger" />
              </RoleGuard>
            }
          />

          {/* Collections */}
          <Route
            path="/collections"
            element={
              <RoleGuard roles={['collections_officer', 'ops_manager', 'it_admin']}>
                <CollectionsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/bureau"
            element={
              <RoleGuard roles={['collections_officer', 'ops_manager', 'it_admin']}>
                <Soon title="Credit Bureau Reporting" />
              </RoleGuard>
            }
          />

          {/* IT Admin */}
          <Route
            path="/admin/users"
            element={
              <RoleGuard roles={['it_admin']}>
                <AdminUsersPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/dora"
            element={
              <RoleGuard roles={['it_admin']}>
                <Soon title="DORA Resilience" />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/api"
            element={
              <RoleGuard roles={['it_admin']}>
                <Soon title="API Management" />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/tprm"
            element={
              <RoleGuard roles={['it_admin']}>
                <Soon title="TPRM Register" />
              </RoleGuard>
            }
          />

          {/* Borrower — uploads docs, submits application, waits for decision */}
          <Route
            path="/borrower"
            element={
              <RoleGuard roles={['borrower_sme']}>
                <BorrowerPage />
              </RoleGuard>
            }
          />
          <Route
            path="/borrower/apply"
            element={
              <RoleGuard roles={['borrower_sme']}>
                <BorrowerApplyPage />
              </RoleGuard>
            }
          />
          <Route
            path="/borrower/messages"
            element={
              <RoleGuard roles={['borrower_sme']}>
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
