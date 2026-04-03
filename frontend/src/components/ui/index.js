import React, { useState, useEffect } from 'react';
import { Loader2, X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

// ── BUTTON ────────────────────────────────────────────────────────────
export const Button = ({ children, variant = 'primary', size = 'md', loading, icon: Icon, disabled, className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 border border-transparent';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  const variants = {
    primary: 'bg-gradient-to-r from-[#00e5be] to-[#00b894] text-[#060b14] hover:opacity-90 hover:shadow-lg hover:shadow-[#00e5be]/20 active:scale-95',
    secondary: 'bg-[#172541] text-[#e8f4fd] border-[rgba(99,179,237,0.15)] hover:bg-[#1e2f4f] hover:border-[rgba(99,179,237,0.3)]',
    danger: 'bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/20 hover:bg-[#f43f5e]/20',
    ghost: 'text-[#7ea4c4] hover:text-[#e8f4fd] hover:bg-[#172541]',
    success: 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20 hover:bg-[#10b981]/20',
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
      style={{ fontFamily: 'var(--font-body)' }}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : Icon ? <Icon size={14} /> : null}
      {children}
    </button>
  );
};

// ── INPUT ─────────────────────────────────────────────────────────────
export const Input = ({ label, error, icon: Icon, suffix, className = '', ...props }) => (
  <div className={`flex flex-col gap-1.5 ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>}
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {Icon && <Icon size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />}
      <input
        style={{
          width: '100%',
          background: 'var(--bg-700)',
          border: `1px solid ${error ? 'var(--expense)' : 'var(--border-bright)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: Icon ? '10px 12px 10px 36px' : '10px 12px',
          paddingRight: suffix ? '48px' : '12px',
          color: 'var(--text-primary)',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(0,229,190,0.1)'; }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--expense)' : 'var(--border-bright)'; e.target.style.boxShadow = 'none'; }}
        {...props}
      />
      {suffix && <span style={{ position: 'absolute', right: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>{suffix}</span>}
    </div>
    {error && <span style={{ fontSize: '12px', color: 'var(--expense)' }}>{error}</span>}
  </div>
);

// ── SELECT ────────────────────────────────────────────────────────────
export const Select = ({ label, error, children, className = '', ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className={className}>
    {label && <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>}
    <select
      style={{
        width: '100%',
        background: 'var(--bg-700)',
        border: `1px solid ${error ? 'var(--expense)' : 'var(--border-bright)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '10px 12px',
        color: 'var(--text-primary)',
        fontSize: '14px',
        outline: 'none',
        cursor: 'pointer',
      }}
      {...props}
    >
      {children}
    </select>
    {error && <span style={{ fontSize: '12px', color: 'var(--expense)' }}>{error}</span>}
  </div>
);

// ── BADGE ─────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    default: { bg: 'rgba(99,179,237,0.1)', color: '#7ea4c4', border: 'rgba(99,179,237,0.2)' },
    income: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
    expense: { bg: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: 'rgba(244,63,94,0.25)' },
    admin: { bg: 'rgba(0,229,190,0.1)', color: '#00e5be', border: 'rgba(0,229,190,0.25)' },
    analyst: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6', border: 'rgba(139,92,246,0.25)' },
    viewer: { bg: 'rgba(99,179,237,0.1)', color: '#63b3ed', border: 'rgba(99,179,237,0.25)' },
    active: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.2)' },
    inactive: { bg: 'rgba(100,116,139,0.1)', color: '#64748b', border: 'rgba(100,116,139,0.2)' },
    warning: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
    success: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
    error: { bg: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: 'rgba(244,63,94,0.25)' },
    info: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
  };
  const v = variants[variant] || variants.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: v.bg, color: v.color, border: `1px solid ${v.border}`,
      borderRadius: '6px', padding: size === 'sm' ? '1px 6px' : '2px 8px',
      fontSize: size === 'sm' ? '10px' : '11px', fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
};

// ── CARD ──────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', style = {}, onClick, glow }) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px',
      boxShadow: glow ? '0 0 30px rgba(0,229,190,0.06)' : 'var(--shadow)',
      transition: 'border-color 0.2s, transform 0.2s',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
    onMouseLeave={e => { if (onClick) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
    className={className}
  >
    {children}
  </div>
);

// ── MODAL ─────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  const sizes = { sm: '400px', md: '540px', lg: '720px', xl: '900px' };
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(6,11,20,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{
        background: 'var(--bg-800)', border: '1px solid var(--border-bright)', borderRadius: 'var(--radius)',
        width: '100%', maxWidth: sizes[size], maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 25px 80px rgba(0,0,0,0.6)', animation: 'popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 700 }}>{title}</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '4px', borderRadius: '6px', display: 'flex', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
        )}
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
};

// ── TOAST ─────────────────────────────────────────────────────────────
let _addToast = null;
export const useToast = () => ({ toast: _addToast || (() => {}) });

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    _addToast = (msg, type = 'info', duration = 3500) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, msg, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    };
  }, []);
  const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
  const colors = { success: '#10b981', error: '#f43f5e', warning: '#f59e0b', info: '#3b82f6' };
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {toasts.map(t => {
        const Icon = icons[t.type] || Info;
        return (
          <div key={t.id} style={{
            background: 'var(--bg-700)', border: `1px solid ${colors[t.type]}30`,
            borderLeft: `3px solid ${colors[t.type]}`,
            borderRadius: 'var(--radius-sm)', padding: '12px 16px', minWidth: '300px', maxWidth: '420px',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.3s ease',
          }}>
            <Icon size={16} style={{ color: colors[t.type], flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── SPINNER ───────────────────────────────────────────────────────────
export const Spinner = ({ size = 20 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
    <Loader2 size={size} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
  </div>
);

// ── EMPTY STATE ───────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px', textAlign: 'center' }}>
    {Icon && <div style={{ background: 'var(--bg-700)', borderRadius: '50%', padding: '20px', marginBottom: '4px' }}><Icon size={28} style={{ color: 'var(--text-muted)' }} /></div>}
    <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '16px', color: 'var(--text-primary)' }}>{title}</h4>
    {description && <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '300px' }}>{description}</p>}
    {action && <div style={{ marginTop: '8px' }}>{action}</div>}
  </div>
);

// ── AVATAR ────────────────────────────────────────────────────────────
export const Avatar = ({ name, size = 36, color }) => {
  const colors = ['#00e5be', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#10b981'];
  const c = color || colors[(name || 'U').charCodeAt(0) % colors.length];
  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${c}20`, border: `1.5px solid ${c}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: c, flexShrink: 0,
      fontFamily: 'var(--font-head)',
    }}>
      {initials}
    </div>
  );
};

// ── CONFIRM DIALOG ────────────────────────────────────────────────────
export const Confirm = ({ open, onClose, onConfirm, title, message, danger }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>{message}</p>
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>
        {danger ? 'Delete' : 'Confirm'}
      </Button>
    </div>
  </Modal>
);
