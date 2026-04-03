import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { categoriesAPI } from '../api/client';
import { TopBar } from '../components/layout/Sidebar';
import { Card, Button, Input, Select, Modal, Confirm, Spinner, useToast } from '../components/ui';

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [form, setForm] = useState({ name: '', type: 'expense', color: '#6366f1', icon: 'tag' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    categoriesAPI.getAll().then(r => setCats(r.data?.categories || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      await categoriesAPI.create(form);
      toast('Category created!', 'success');
      setModal(false);
      setForm({ name: '', type: 'expense', color: '#6366f1', icon: 'tag' });
      load();
    } catch (err) { toast(err.error || 'Create failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await categoriesAPI.delete(id); toast('Category deleted', 'success'); load(); }
    catch (err) { toast(err.error || 'Delete failed', 'error'); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const income = cats.filter(c => c.type === 'income');
  const expense = cats.filter(c => c.type === 'expense');

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <TopBar title="Categories" subtitle={`${cats.length} categories`}
        actions={<Button size="sm" icon={Plus} onClick={() => setModal(true)}>Add Category</Button>} />

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? <Spinner /> : (
          <>
            {[{ label: 'Income Categories', items: income, color: 'var(--income)' }, { label: 'Expense Categories', items: expense, color: 'var(--expense)' }].map(group => (
              <Card key={group.label}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: group.color }}>{group.label} ({group.items.length})</h3>
                {group.items.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No {group.label.toLowerCase()} yet.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {group.items.map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</span>
                        </div>
                        <button onClick={() => setDeleteConfirm({ open: true, id: c.id, name: c.name })}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '3px', borderRadius: '5px', display: 'flex' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--expense)'; e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Category" size="sm">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Category Name" placeholder="e.g. Side Income" value={form.name} onChange={set('name')} required />
          <Select label="Type" value={form.type} onChange={set('type')}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="both">Both</option>
          </Select>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Color</label>
            <input type="color" value={form.color} onChange={set('color')} style={{ width: '60px', height: '36px', background: 'none', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', padding: '2px' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Category</Button>
          </div>
        </form>
      </Modal>

      <Confirm open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Delete Category" message={`Delete "${deleteConfirm.name}"? Existing transactions using this category will be unaffected.`} danger />
    </div>
  );
}
