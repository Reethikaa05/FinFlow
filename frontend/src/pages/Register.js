import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Select, useToast } from '../components/ui';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register(form);
      toast('Account created! Welcome to FinFlow.', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast(err.error || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.5s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg, #00e5be, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>FinFlow</span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '14px' }}>Join FinFlow to manage your finances</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Full Name" type="text" placeholder="Jane Doe" icon={User} value={form.name} onChange={set('name')} error={errors.name} />
            <Input label="Email" type="email" placeholder="you@example.com" icon={Mail} value={form.email} onChange={set('email')} error={errors.email} />
            <Input label="Password" type="password" placeholder="Min 6 characters" icon={Lock} value={form.password} onChange={set('password')} error={errors.password} />
            <Select label="Role" value={form.role} onChange={set('role')}>
              <option value="viewer">Viewer – Read only</option>
              <option value="analyst">Analyst – Read + Create</option>
              <option value="admin">Admin – Full access</option>
            </Select>
            <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '4px', padding: '12px' }}>
              Create Account <ArrowRight size={14} />
            </Button>
          </form>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
