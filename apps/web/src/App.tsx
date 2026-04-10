import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Placeholder for screens not yet built
const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '2rem', fontFamily: theme.fonts.heading }}>
    <h1 style={{ color: theme.colors.primary[800] }}>{title} — coming soon</h1>
  </div>
);

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route
          path="/auth/login"
          element={<LoginPage />}
        />
        <Route
          path="/auth/register"
          element={<RegisterPage />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
          path="/admin/dashboard"
          element={<Dashboard />}
        />

        {/* Coming next */}
        <Route
          path="/portfolio"
          element={<Placeholder title="Loan portfolio" />}
        />
        <Route
          path="/applications/*"
          element={<Placeholder title="Applications" />}
        />
        <Route
          path="/decisions"
          element={<Placeholder title="Decisions" />}
        />
        <Route
          path="/payments"
          element={<Placeholder title="SEPA payments" />}
        />
        <Route
          path="/mandates"
          element={<Placeholder title="SDD mandates" />}
        />
        <Route
          path="/ifrs9"
          element={<Placeholder title="IFRS 9 / ECL" />}
        />
        <Route
          path="/models"
          element={<Placeholder title="Model monitoring" />}
        />
        <Route
          path="/audit"
          element={<Placeholder title="Audit evidence" />}
        />
        <Route
          path="/ccr"
          element={<Placeholder title="CCR / AnaCredit" />}
        />
        <Route
          path="/collateral"
          element={<Placeholder title="Collateral" />}
        />
        <Route
          path="/admin/*"
          element={<Placeholder title="Admin" />}
        />

        {/* Default */}
        <Route
          path="/"
          element={
            <Navigate
              to="/auth/login"
              replace
            />
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to="/auth/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
