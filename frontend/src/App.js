import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ToastContainer } from './components/ui';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Categories from './pages/Categories';
import AuditLogs from './pages/AuditLogs';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:'16px', background:'var(--bg-900)' }}>
      <div style={{ width:44, height:44, borderRadius:'12px', background:'linear-gradient(135deg,#00e5be,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>⚡</div>
      <div style={{ fontSize:'13px', color:'var(--text-muted)', fontFamily:'var(--font-body)' }}>Loading FinFlow...</div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};
const AdminRoute = ({ children }) => { const { user } = useAuth(); return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />; };
const AnalystRoute = ({ children }) => { const { user } = useAuth(); return ['admin','analyst'].includes(user?.role) ? children : <Navigate to="/dashboard" replace />; };
const PublicRoute = ({ children }) => { const { user } = useAuth(); return !user ? children : <Navigate to="/dashboard" replace />; };

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="analytics" element={<AnalystRoute><Analytics /></AnalystRoute>} />
        <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="categories" element={<AdminRoute><Categories /></AdminRoute>} />
        <Route path="audit" element={<AdminRoute><AuditLogs /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}
