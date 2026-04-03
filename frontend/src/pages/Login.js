import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, TrendingUp, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, useToast } from '../components/ui';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email) errs.email = 'Email required';
    if (!form.password) errs.password = 'Password required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast(err.error || 'Login failed', 'error');
      setErrors({ password: err.error || 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email, password) => { setForm({ email, password }); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-900)', display: 'flex' }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px', position: 'relative', overflow: 'hidden',
      }}>
        {/* BG decoration */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,229,190,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Card */}
        <div style={{
          width: '100%', maxWidth: '400px', animation: 'fadeIn 0.5s ease',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg, #00e5be, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>FinFlow</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Welcome back
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
            Sign in to your finance dashboard
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              autoComplete="email"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="current-password"
                  style={{
                    width: '100%', background: 'var(--bg-700)', border: `1px solid ${errors.password ? 'var(--expense)' : 'var(--border-bright)'}`,
                    borderRadius: 'var(--radius-sm)', padding: '10px 40px 10px 36px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px rgba(0,229,190,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = errors.password ? 'var(--expense)' : 'var(--border-bright)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: '12px', color: 'var(--expense)' }}>{errors.password}</span>}
            </div>

            <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '4px', padding: '12px' }}>
              Sign In <ArrowRight size={14} />
            </Button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '20px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Register</Link>
          </p>

          {/* Quick login */}
          <div style={{ marginTop: '28px', padding: '16px', background: 'var(--bg-700)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontWeight: 600 }}>Quick login (dev)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Admin', email: 'admin@finflow.com', pw: 'admin123', color: '#00e5be' },
                { label: 'Analyst', email: 'sarah@finflow.com', pw: 'password123', color: '#8b5cf6' },
                { label: 'Viewer', email: 'john@finflow.com', pw: 'password123', color: '#3b82f6' },
              ].map(u => (
                <button
                  key={u.label}
                  onClick={() => quickLogin(u.email, u.pw)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', background: `${u.color}0d`, border: `1px solid ${u.color}25`, borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontSize: '10px', fontWeight: 700, color: u.color, textTransform: 'uppercase', width: '48px' }}>{u.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - decorative */}
      <div style={{
        width: '45%', background: 'var(--bg-800)', borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,229,190,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '340px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '26px', fontWeight: 800, marginBottom: '12px', lineHeight: 1.3 }}>
            Your finances,<br /><span style={{ color: 'var(--accent)' }}>crystal clear.</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>
            Track income, expenses, and trends. Role-based access keeps your team aligned and your data secure.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '32px' }}>
            {[
              { label: 'Real-time Tracking', icon: '⚡' },
              { label: 'Role-based Access', icon: '🔐' },
              { label: 'Rich Analytics', icon: '📈' },
              { label: 'Smart Alerts', icon: '🔔' },
            ].map(f => (
              <div key={f.label} style={{ padding: '14px', background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'left' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{f.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
