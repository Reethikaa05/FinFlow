import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpRight, ArrowDownRight, RefreshCw, Plus } from 'lucide-react';
import { dashboardAPI } from '../api/client';
import { TopBar } from '../components/layout/Sidebar';
import { Card, Button, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const fmtShort = (n) => {
  const abs = Math.abs(n || 0);
  if (abs >= 10000000) return `₹${(abs / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${(abs / 1000).toFixed(0)}K`;
  return `₹${abs.toFixed(0)}`;
};

const StatCard = ({ label, value, change, icon: Icon, color, sub }) => (
  <Card style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`, pointerEvents: 'none' }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ padding: '8px', borderRadius: '10px', background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon size={18} style={{ color }} />
      </div>
      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: change >= 0 ? 'var(--income)' : 'var(--expense)', background: change >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', padding: '3px 8px', borderRadius: '20px' }}>
          {change >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {Math.abs(change).toFixed(1)}%
        </div>
      )}
    </div>
    <div style={{ fontSize: '26px', fontFamily: 'var(--font-head)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{value}</div>
    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</div>
    {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>}
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-700)', border: '1px solid var(--border-bright)', borderRadius: '10px', padding: '12px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: '13px', fontWeight: 600, color: p.color, display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{p.name}:</span> {fmtShort(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, isAnalyst } = useAuth();
  const navigate = useNavigate();

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await dashboardAPI.getSummary();
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div>
      <TopBar title="Dashboard" subtitle={`Welcome back, ${user?.name?.split(' ')[0]}`} />
      <div style={{ padding: '24px' }}><Spinner /></div>
    </div>
  );

  const s = data?.summary || {};
  const trend = data?.monthlyTrend || [];
  const catData = (data?.categoryBreakdown || []).filter(c => c.type === 'expense').slice(0, 6);
  const recent = data?.recentTransactions || [];
  const topExp = data?.topExpenses || [];

  const monthLabels = trend.map(t => {
    const [y, m] = t.month.split('-');
    return new Date(y, m - 1).toLocaleString('default', { month: 'short' });
  });

  const PIE_COLORS = ['#00e5be','#3b82f6','#8b5cf6','#f59e0b','#f43f5e','#10b981'];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <TopBar
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" icon={RefreshCw} loading={refreshing} onClick={() => load(true)}>Refresh</Button>
            {isAnalyst && <Button size="sm" icon={Plus} onClick={() => navigate('/transactions?new=1')}>New Transaction</Button>}
          </div>
        }
      />

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <StatCard label="Total Income" value={fmtShort(s.total_income)} icon={TrendingUp} color="var(--income)" sub={`${s.income_count || 0} transactions`} />
          <StatCard label="Total Expenses" value={fmtShort(s.total_expenses)} icon={TrendingDown} color="var(--expense)" sub={`${s.expense_count || 0} transactions`} />
          <StatCard label="Net Balance" value={fmtShort(s.net_balance)} icon={DollarSign} color={s.net_balance >= 0 ? 'var(--accent)' : 'var(--expense)'} sub={`${s.savings_rate}% savings rate`} />
          <StatCard label="Total Records" value={(s.total_transactions || 0).toLocaleString()} icon={Activity} color="var(--accent2)" sub="All time" />
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          {/* Monthly trend */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '15px', fontWeight: 700 }}>6-Month Trend</h3>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, background: 'var(--income)', borderRadius: '50%', display: 'inline-block' }} />Income</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, background: 'var(--expense)', borderRadius: '50%', display: 'inline-block' }} />Expenses</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend.map((t, i) => ({ ...t, name: monthLabels[i], income: t.income, expenses: t.expenses }))}>
                <defs>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtShort} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#incGrad)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Category pie */}
          <Card>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="total" paddingAngle={3}>
                  {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtShort(v)} contentStyle={{ background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              {catData.slice(0, 4).map((c, i) => (
                <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 8, height: 8, background: PIE_COLORS[i], borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>{c.category}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{fmtShort(c.total)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Recent transactions */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '15px', fontWeight: 700 }}>Recent Activity</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>View all →</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {recent.slice(0, 7).map((tx, i) => (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0',
                  borderBottom: i < 6 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: tx.type === 'income' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                    {tx.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || tx.category}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tx.category} · {tx.date}</div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)', flexShrink: 0 }}>
                    {tx.type === 'income' ? '+' : '-'}{fmtShort(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top expenses bar chart */}
          <Card>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Top Expenses</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topExp} layout="vertical">
                <XAxis type="number" tickFormatter={fmtShort} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v) => [fmtShort(v), 'Total']} contentStyle={{ background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {topExp.map((_, i) => <Cell key={i} fill={`${PIE_COLORS[i % PIE_COLORS.length]}cc`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
