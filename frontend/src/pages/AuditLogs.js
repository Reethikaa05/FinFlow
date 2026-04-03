import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { TopBar } from '../components/layout/Sidebar';
import { Card, Button, Badge, Spinner, EmptyState } from '../components/ui';

const actionColors = { CREATE: 'success', UPDATE: 'info', DELETE: 'error' };

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs', { params: { page: p, limit: 30 } });
      setLogs(res.data?.logs || []);
      setTotal(res.data?.pagination?.total || 0);
      setPage(p);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <TopBar title="Audit Logs" subtitle={`${total} total events`}
        actions={<Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => load(1)}>Refresh</Button>} />
      <div style={{ padding: '24px' }}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? <Spinner /> : logs.length === 0 ? <EmptyState icon={Shield} title="No audit logs yet" /> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Time', 'User', 'Action', 'Resource', 'Resource ID', 'IP'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log.id} style={{ borderBottom: i < logs.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</td>
                      <td style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{log.user_name || 'System'}</td>
                      <td style={{ padding: '10px 16px' }}><Badge variant={actionColors[log.action] || 'default'}>{log.action}</Badge></td>
                      <td style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>{log.resource}</td>
                      <td style={{ padding: '10px 16px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.resource_id || '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.ip || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
