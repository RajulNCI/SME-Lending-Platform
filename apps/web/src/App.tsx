import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ROLE_HOME } from './types/auth';

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

// Placeholder for pages not yet built
import PageLayout from './components/layout/PageLayout';
const Soon: React.FC<{title:string}> = ({title}) => (
  <PageLayout title={title}>
    <div style={{textAlign:'center',padding:'3rem 1rem'}}>
      <p style={{fontSize:'2rem',margin:'0 0 .75rem'}}>🚧</p>
      <h2 style={{color:'#0C2B5E',fontFamily:"'Inter',sans-serif",margin:'0 0 .5rem'}}>{title}</h2>
      <p style={{color:'#718096',fontSize:'.9375rem'}}>This screen is being built. Check back soon.</p>
    </div>
  </PageLayout>
);

// Protected route wrapper
const Protected: React.FC<{children:React.ReactNode}> = ({children}) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Default redirect after login based on role
const DefaultRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role]} replace />;
};

const App: React.FC = () => (
  <AuthProvider>
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — all roles */}
          <Route path="/intake"           element={<Protected><IntakePage /></Protected>} />
          <Route path="/queue"            element={<Protected><QueuePage /></Protected>} />
          <Route path="/audit"            element={<Protected><AuditPage /></Protected>} />
          <Route path="/dashboard"        element={<Protected><DashboardPage /></Protected>} />
          <Route path="/risk"             element={<Protected><RiskPage /></Protected>} />
          <Route path="/risk/models"      element={<Protected><RiskPage /></Protected>} />
          <Route path="/risk/stress"      element={<Protected><RiskPage /></Protected>} />
          <Route path="/risk/ewi"         element={<Protected><Soon title="Early Warning Indicators" /></Protected>} />
          <Route path="/collections"      element={<Protected><CollectionsPage /></Protected>} />
          <Route path="/bureau"           element={<Protected><Soon title="Credit Bureau Reporting" /></Protected>} />
          <Route path="/mrm"              element={<Protected><MrmPage /></Protected>} />
          <Route path="/mrm/metrics"      element={<Protected><MrmPage /></Protected>} />
          <Route path="/mrm/drift"        element={<Protected><MrmPage /></Protected>} />
          <Route path="/mrm/challenger"   element={<Protected><Soon title="Champion-Challenger" /></Protected>} />
          <Route path="/admin/users"      element={<Protected><AdminUsersPage /></Protected>} />
          <Route path="/admin/dora"       element={<Protected><Soon title="DORA Resilience" /></Protected>} />
          <Route path="/admin/api"        element={<Protected><Soon title="API Management" /></Protected>} />
          <Route path="/admin/tprm"       element={<Protected><Soon title="TPRM Register" /></Protected>} />
          <Route path="/borrower"         element={<Protected><BorrowerPage /></Protected>} />
          <Route path="/borrower/apply"   element={<Protected><Soon title="New Application" /></Protected>} />
          <Route path="/borrower/messages"element={<Protected><Soon title="Messages" /></Protected>} />
          <Route path="/payments"         element={<Protected><Soon title="SEPA Payments" /></Protected>} />
          <Route path="/mandates"         element={<Protected><Soon title="SDD Mandates" /></Protected>} />
          <Route path="/sla"              element={<Protected><Soon title="SLA Monitor" /></Protected>} />
          <Route path="/ccr"              element={<Protected><Soon title="CCR / AnaCredit" /></Protected>} />
          <Route path="/gdpr"             element={<Protected><Soon title="GDPR Requests" /></Protected>} />
          <Route path="/applications/new" element={<Protected><Soon title="New Application" /></Protected>} />
          <Route path="/settings"         element={<Protected><Soon title="Settings" /></Protected>} />

          {/* Default redirects */}
          <Route path="/" element={<DefaultRedirect />} />
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </AuthProvider>
);

export default App;
