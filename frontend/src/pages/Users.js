import React, { useState, useEffect, useCallback } from 'react';
import { Users as UsersIcon, Search, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { usersAPI } from '../api/client';
import { TopBar } from '../components/layout/Sidebar';
import { Card, Button, Input, Select, Badge, Modal, Confirm, Spinner, EmptyState, Avatar, useToast } from '../components/ui';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ role: '', status: '', search: '' });
  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, sRes] = await Promise.all([
        usersAPI.getAll(Object.fromEntries(Object.entries(filters).filter(([,v]) => v))),
        usersAPI.getStats()
      ]);
      setUsers(uRes.data?.users || []);
      setStats(sRes.data?.stats || {});
    } catch { toast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  }, [filters, toast]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await usersAPI.update(editModal.user.id, data);
      toast('User updated!', 'success');
      setEditModal({ open: false, user: null });
      load();
    } catch (e) { toast(e.error || 'Update failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await usersAPI.delete(id);
      toast('User deleted', 'success');
      load();
    } catch (e) { toast(e.error || 'Delete failed', 'error'); }
  };

  const setFilter = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <TopBar title="User Management" subtitle="Manage roles & access"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={load}>Refresh</Button>
          </div>
        }
      />
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Total Users', value: stats.total || 0, color: '#00e5be' },
            { label: 'Active', value: stats.active || 0, color: '#10b981' },
            { label: 'Admins', value: stats.admins || 0, color: '#f59e0b' },
            { label: 'Analysts', value: stats.analysts || 0, color: '#8b5cf6' },
            { label: 'Viewers', value: stats.viewers || 0, color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontFamily: 'var(--font-head)', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input placeholder="Search users..." value={filters.search} onChange={setFilter('search')}
              style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '9px 12px 9px 30px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <select value={filters.role} onChange={setFilter('role')} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </select>
          <select value={filters.status} onChange={setFilter('status')} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? <Spinner /> : users.length === 0 ? <EmptyState icon={UsersIcon} title="No users found" /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar name={u.name} size={32} />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}><Badge variant={u.role}>{u.role}</Badge></td>
                    <td style={{ padding: '12px 16px' }}><Badge variant={u.status}>{u.status}</Badge></td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>{u.created_at?.slice(0, 10)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => setEditModal({ open: true, user: u })} style={{ padding: '5px', borderRadius: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-600)'; e.currentTarget.style.color = 'var(--accent2)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteConfirm({ open: true, id: u.id, name: u.name })} style={{ padding: '5px', borderRadius: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; e.currentTarget.style.color = 'var(--expense)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal open={editModal.open} onClose={() => setEditModal({ open: false, user: null })} title="Edit User" size="sm">
        {editModal.user && <EditUserForm user={editModal.user} onSave={handleUpdate} onClose={() => setEditModal({ open: false, user: null })} loading={saving} />}
      </Modal>

      <Confirm open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Delete User" message={`Are you sure you want to delete "${deleteConfirm.name}"? This cannot be undone.`} danger />
    </div>
  );
}

function EditUserForm({ user, onSave, onClose, loading }) {
  const [form, setForm] = useState({ name: user.name, role: user.role, status: user.status });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-700)', borderRadius: '10px' }}>
        <Avatar name={user.name} size={40} />
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>{user.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
        </div>
      </div>
      <Input label="Name" value={form.name} onChange={set('name')} />
      <Select label="Role" value={form.role} onChange={set('role')}>
        <option value="viewer">Viewer</option>
        <option value="analyst">Analyst</option>
        <option value="admin">Admin</option>
      </Select>
      <Select label="Status" value={form.status} onChange={set('status')}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </Select>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button loading={loading} onClick={() => onSave(form)}>Save Changes</Button>
      </div>
    </div>
  );
}
