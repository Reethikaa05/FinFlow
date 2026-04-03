import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, RefreshCw, Send } from 'lucide-react';
import { notificationsAPI } from '../api/client';
import { TopBar } from '../components/layout/Sidebar';
import { Card, Button, Badge, Spinner, EmptyState, Modal, Input, Select, useToast } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';

const typeColors = { success: '#10b981', error: '#f43f5e', warning: '#f59e0b', info: '#3b82f6' };
const typeIcons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const ctx = useOutletContext();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll({ limit: 50 });
      setNotifs(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch { toast('Failed to load notifications', 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: 1 } : x));
    setUnreadCount(c => Math.max(0, c - 1));
    ctx?.refreshNotifs?.();
  };

  const markAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifs(n => n.map(x => ({ ...x, is_read: 1 })));
    setUnreadCount(0);
    ctx?.refreshNotifs?.();
    toast('All marked as read', 'success');
  };

  const deleteNotif = async (id) => {
    await notificationsAPI.delete(id);
    setNotifs(n => n.filter(x => x.id !== id));
    toast('Notification deleted', 'info');
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <TopBar
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            {unreadCount > 0 && <Button variant="secondary" size="sm" icon={CheckCheck} onClick={markAllRead}>Mark all read</Button>}
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={load}>Refresh</Button>
            {isAdmin && <Button size="sm" icon={Send} onClick={() => setBroadcastModal(true)}>Broadcast</Button>}
          </div>
        }
      />
      <div style={{ padding: '24px' }}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? <Spinner /> : notifs.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up! Notifications will appear here." />
          ) : (
            <div>
              {notifs.map((n, i) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px',
                    borderBottom: i < notifs.length - 1 ? '1px solid var(--border)' : 'none',
                    background: n.is_read ? 'transparent' : 'rgba(0,229,190,0.02)',
                    transition: 'background 0.2s',
                    cursor: n.is_read ? 'default' : 'pointer',
                  }}
                  onClick={() => { if (!n.is_read) markRead(n.id); }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(0,229,190,0.02)'}
                >
                  {/* Icon */}
                  <div style={{ width: 38, height: 38, borderRadius: '10px', background: `${typeColors[n.type]}15`, border: `1px solid ${typeColors[n.type]}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                    {typeIcons[n.type] || 'ℹ️'}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '13px', fontWeight: n.is_read ? 500 : 700, color: 'var(--text-primary)' }}>{n.title}</span>
                      {!n.is_read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
                      <Badge variant={n.type} size="sm">{n.type}</Badge>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '4px' }}>{n.message}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {!n.is_read && (
                      <button onClick={(e) => { e.stopPropagation(); markRead(n.id); }} title="Mark read"
                        style={{ padding: '5px', borderRadius: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(0,229,190,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}>
                        <CheckCheck size={13} />
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }} title="Delete"
                      style={{ padding: '5px', borderRadius: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--expense)'; e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Broadcast Modal */}
      <Modal open={broadcastModal} onClose={() => setBroadcastModal(false)} title="Broadcast Notification" size="sm">
        <BroadcastForm onSend={async (data) => {
          try {
            await notificationsAPI.broadcast(data);
            toast('Notification broadcasted!', 'success');
            setBroadcastModal(false);
          } catch (e) { toast(e.error || 'Failed to broadcast', 'error'); }
        }} onClose={() => setBroadcastModal(false)} />
      </Modal>
    </div>
  );
}

function BroadcastForm({ onSend, onClose }) {
  const [form, setForm] = useState({ title: '', message: '', type: 'info', targetRole: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) return;
    setLoading(true);
    try { await onSend(form); } finally { setLoading(false); }
  };
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Input label="Title" placeholder="Notification title" value={form.title} onChange={set('title')} required />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Message</label>
        <textarea placeholder="Notification message..." value={form.message} onChange={set('message')} required rows={3}
          style={{ background: 'var(--bg-700)', border: '1px solid var(--border-bright)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical' }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border-bright)'; }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Select label="Type" value={form.type} onChange={set('type')}>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </Select>
        <Select label="Target Role" value={form.targetRole} onChange={set('targetRole')}>
          <option value="">All users</option>
          <option value="viewer">Viewers only</option>
          <option value="analyst">Analysts only</option>
          <option value="admin">Admins only</option>
        </Select>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" icon={Send} loading={loading}>Send Broadcast</Button>
      </div>
    </form>
  );
}
