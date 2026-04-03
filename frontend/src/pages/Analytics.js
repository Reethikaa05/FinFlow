import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { dashboardAPI } from '../api/client';
import { TopBar } from '../components/layout/Sidebar';
import { Card, Spinner } from '../components/ui';

const fmtShort = (n) => {
  const abs = Math.abs(n || 0);
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${(abs / 1000).toFixed(0)}K`;
  return `₹${abs.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-700)', border: '1px solid var(--border-bright)', borderRadius: '10px', padding: '12px 14px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: '12px', color: p.color, display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span> {fmtShort(p.value)}
        </div>
      ))}
    </div>
  );
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getAnalytics()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div><TopBar title="Analytics" /><Spinner /></div>;

  // Build monthly data
  const months = {};
  (data?.monthOverMonth || []).forEach(row => {
    if (!months[row.month]) months[row.month] = { month: row.month.slice(5), income: 0, expenses: 0 };
    if (row.type === 'income') months[row.month].income = row.total;
    else months[row.month].expenses = row.total;
  });
  const monthlyData = Object.values(months).slice(-8);

  // Day of week
  const dowMap = {};
  (data?.dayOfWeekPattern || []).forEach(row => {
    if (!dowMap[row.dow]) dowMap[row.dow] = { day: DAYS[row.dow], income: 0, expense: 0 };
    if (row.type === 'income') dowMap[row.dow].income = row.avg_amount;
    else dowMap[row.dow].expense = row.avg_amount;
  });
  const dowData = Object.values(dowMap).sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));

  const incomeSources = data?.incomeSources || [];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <TopBar title="Analytics" subtitle="Deep insights into your financial patterns" />
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Month over month */}
        <Card>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Month-over-Month Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.06)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtShort} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Day of week */}
          <Card>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Avg Spend by Day of Week</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.06)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtShort} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: '#f43f5e', strokeWidth: 0, r: 4 }} />
                <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Income sources */}
          <Card>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Top Income Sources</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {incomeSources.map((s, i) => {
                const pct = incomeSources[0] ? (s.total / incomeSources[0].total) * 100 : 0;
                const colors = ['#00e5be', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
                return (
                  <div key={s.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{s.category}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: colors[i % colors.length] }}>{fmtShort(s.total)}</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--bg-700)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: colors[i % colors.length], borderRadius: '2px', transition: 'width 0.8s ease' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{s.count} transactions</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
