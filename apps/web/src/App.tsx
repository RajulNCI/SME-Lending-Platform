import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Placeholder pages — we build these next
const Dashboard = () => (
  <div style={{ padding: '2rem', fontFamily: theme.fonts.heading }}>
    <h1 style={{ color: theme.colors.primary[800] }}>Dashboard — coming next</h1>
  </div>
);

const AdminDashboard = () => (
  <div style={{ padding: '2rem', fontFamily: theme.fonts.heading }}>
    <h1 style={{ color: theme.colors.primary[800] }}>Admin Dashboard — coming next</h1>
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles theme={theme} />
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/auth/login"    element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* App */}
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
