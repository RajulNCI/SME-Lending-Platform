import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

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

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login"      element={<LoginPage />} />
        <Route path="/auth/register"   element={<RegisterPage />} />
        <Route path="/dashboard"       element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/"  element={<Navigate to="/auth/login" replace />} />
        <Route path="*"  element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
