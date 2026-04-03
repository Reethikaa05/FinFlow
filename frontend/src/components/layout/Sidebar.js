import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, Users, Bell, Tag,
  LogOut, ChevronRight, Settings,
  TrendingUp, Shield, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Badge } from '../ui';

const NavItem = ({ to, icon: Icon, label, badge, collapsed }) => (
  <NavLink
    to={to}
    style={({ isActive }) => ({
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: collapsed ? '10px' : '10px 12px',
      borderRadius: '10px', fontSize: '13.5px', fontWeight: 500,
      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
      background: isActive ? 'rgba(0,229,190,0.08)' : 'transparent',
      border: isActive ? '1px solid rgba(0,229,190,0.12)' : '1px solid transparent',
      transition: 'all 0.18s', textDecoration: 'none',
      justifyContent: collapsed ? 'center' : 'flex-start',
    })}
    onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = 'rgba(99,179,237,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
    onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
  >
    <Icon size={16} style={{ flexShrink: 0 }} />
    {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
    {!collapsed && badge > 0 && (
      <span style={{ background: 'var(--expense)', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '10px', minWidth: '16px', textAlign: 'center' }}>
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </NavLink>
);

export const Sidebar = ({ unreadCount = 0 }) => {
  const { user, logout, isAdmin, isAnalyst } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: collapsed ? '64px' : '240px', minHeight: '100vh',
      background: 'var(--bg-800)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease',
      position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100, overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', minHeight: '64px' }}>
        <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #00e5be, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <TrendingUp size={16} color="#fff" />
        </div>
        {!collapsed && <span style={{ fontFamily: 'var(--font-head)', fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>FinFlow</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', padding: '4px', cursor: 'pointer', flexShrink: 0, display: 'flex' }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', overflowX: 'hidden' }}>
        {!collapsed && <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 4px 4px' }}>Overview</div>}
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
        <NavItem to="/transactions" icon={ArrowLeftRight} label="Transactions" collapsed={collapsed} />

        {isAnalyst && (
          <>
            {!collapsed && <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 4px 4px' }}>Insights</div>}
            <NavItem to="/analytics" icon={Activity} label="Analytics" collapsed={collapsed} />
          </>
        )}

        {isAdmin && (
          <>
            {!collapsed && <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 4px 4px' }}>Admin</div>}
            <NavItem to="/users" icon={Users} label="Users" collapsed={collapsed} />
            <NavItem to="/categories" icon={Tag} label="Categories" collapsed={collapsed} />
            <NavItem to="/audit" icon={Shield} label="Audit Logs" collapsed={collapsed} />
          </>
        )}

        {!collapsed && <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 4px 4px' }}>Account</div>}
        <NavItem to="/notifications" icon={Bell} label="Notifications" badge={unreadCount} collapsed={collapsed} />
        <NavItem to="/profile" icon={Settings} label="Profile" collapsed={collapsed} />
      </nav>

      {/* User */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '10px', background: 'var(--bg-700)' }}>
          <Avatar name={user?.name} size={30} />
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <Badge variant={user?.role} size="sm">{user?.role}</Badge>
            </div>
          )}
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', flexShrink: 0 }} title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export const TopBar = ({ title, subtitle, actions }) => (
  <header style={{
    height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', borderBottom: '1px solid var(--border)',
    background: 'rgba(6,11,20,0.8)', backdropFilter: 'blur(12px)',
    position: 'sticky', top: 0, zIndex: 50,
  }}>
    <div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>{actions}</div>}
  </header>
);
