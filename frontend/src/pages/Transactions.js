import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, X, RefreshCw } from 'lucide-react';
import { transactionsAPI, categoriesAPI } from '../api/client';
import { TopBar } from '../components/layout/Sidebar';
import { Card, Button, Input, Select, Badge, Modal, Confirm, Spinner, EmptyState, useToast } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(n || 0));

const TxForm = ({ initial, categories, onSave, onClose, loading }) => {
  const [form, setForm] = useState(initial || { amount: '', type: 'income', category: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Valid positive amount required';
    if (!form.category) e.category = 'Category required';
    if (!form.date) e.date = 'Date required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, amount: parseFloat(form.amount) });
  };

  const filteredCats = categories.filter(c => c.type === form.type || c.type === 'both');

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Select label="Type" value={form.type} onChange={set('type')}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </Select>
        <Input label="Amount (₹)" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={set('amount')} error={errors.amount} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Select label="Category" value={form.category} onChange={set('category')} error={errors.category}>
          <option value="">Select category</option>
          {filteredCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </Select>
        <Input label="Date" type="date" value={form.date} onChange={set('date')} error={errors.date} />
      </div>
      <Input label="Description (optional)" type="text" placeholder="What was this for?" value={form.description} onChange={set('description')} />
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial ? 'Update Transaction' : 'Create Transaction'}</Button>
      </div>
    </form>
  );
};

export default function Transactions() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters] = useState({ type: '', category: '', search: '', startDate: '', endDate: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [modal, setModal] = useState({ open: false, tx: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const { isAnalyst, isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    categoriesAPI.getAll().then(r => setCategories(r.data?.categories || [])).catch(() => {});
    if (searchParams.get('new') === '1' && isAnalyst) {
      setModal({ open: true, tx: null });
    }
  }, []);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
      const res = await transactionsAPI.getAll(params);
      setTxs(res.data?.transactions || []);
      setPagination(res.data?.pagination || { page: 1, total: 0, pages: 1 });
    } catch (e) { toast('Failed to load transactions', 'error'); }
    finally { setLoading(false); }
  }, [filters, toast]);

  useEffect(() => { load(1); }, [load]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (modal.tx) {
        await transactionsAPI.update(modal.tx.id, data);
        toast('Transaction updated!', 'success');
      } else {
        await transactionsAPI.create(data);
        toast('Transaction created!', 'success');
      }
      setModal({ open: false, tx: null });
      load(pagination.page);
    } catch (e) { toast(e.error || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await transactionsAPI.delete(id);
      toast('Transaction deleted', 'success');
      load(pagination.page);
    } catch (e) { toast(e.error || 'Delete failed', 'error'); }
  };

  const setFilter = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }));
  const clearFilters = () => setFilters({ type: '', category: '', search: '', startDate: '', endDate: '' });
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <TopBar
        title="Transactions"
        subtitle={`${pagination.total} total records`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
              Filters {activeFilterCount > 0 && <span style={{ background: 'var(--accent)', color: '#060b14', borderRadius: '50%', width: '14px', height: '14px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{activeFilterCount}</span>}
            </Button>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => load(pagination.page)}>Refresh</Button>
            {isAnalyst && <Button size="sm" icon={Plus} onClick={() => setModal({ open: true, tx: null })}>New</Button>}
          </div>
        }
      />

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Search */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              placeholder="Search by description or category..."
              value={filters.search}
              onChange={setFilter('search')}
              style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px 10px 36px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <Card style={{ padding: '16px', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', alignItems: 'end' }}>
              <Select label="Type" value={filters.type} onChange={setFilter('type')}>
                <option value="">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Select>
              <Select label="Category" value={filters.category} onChange={setFilter('category')}>
                <option value="">All categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </Select>
              <Input label="From" type="date" value={filters.startDate} onChange={setFilter('startDate')} />
              <Input label="To" type="date" value={filters.endDate} onChange={setFilter('endDate')} />
              <Button variant="secondary" size="sm" icon={X} onClick={clearFilters}>Clear</Button>
            </div>
          </Card>
        )}

        {/* Table */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? <Spinner /> : txs.length === 0 ? (
            <EmptyState icon={Filter} title="No transactions found" description="Try adjusting your filters or create a new transaction." action={isAnalyst && <Button icon={Plus} onClick={() => setModal({ open: true, tx: null })}>Create Transaction</Button>} />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Date', 'Description', 'Category', 'Type', 'Amount', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Amount' ? 'right' : 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txs.map((tx, i) => (
                    <tr key={tx.id} style={{ borderBottom: i < txs.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{tx.date}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || '—'}</td>
                      <td style={{ padding: '12px 16px' }}><Badge variant="default">{tx.category}</Badge></td>
                      <td style={{ padding: '12px 16px' }}><Badge variant={tx.type}>{tx.type}</Badge></td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-head)', color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)', whiteSpace: 'nowrap' }}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          {isAnalyst && (
                            <button onClick={() => setModal({ open: true, tx: { ...tx, amount: Math.abs(tx.amount) } })} style={{ padding: '5px', borderRadius: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-600)'; e.currentTarget.style.color = 'var(--accent2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                              <Edit2 size={13} />
                            </button>
                          )}
                          {isAdmin && (
                            <button onClick={() => setDeleteConfirm({ open: true, id: tx.id })} style={{ padding: '5px', borderRadius: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; e.currentTarget.style.color = 'var(--expense)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing {((pagination.page - 1) * 15) + 1}–{Math.min(pagination.page * 15, pagination.total)} of {pagination.total}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)} />
              <span style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-primary)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                {pagination.page} / {pagination.pages}
              </span>
              <Button variant="secondary" size="sm" icon={ChevronRight} disabled={pagination.page >= pagination.pages} onClick={() => load(pagination.page + 1)} />
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, tx: null })} title={modal.tx ? 'Edit Transaction' : 'New Transaction'}>
        <TxForm initial={modal.tx} categories={categories} onSave={handleSave} onClose={() => setModal({ open: false, tx: null })} loading={saving} />
      </Modal>

      {/* Delete confirm */}
      <Confirm open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })} onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Delete Transaction" message="This will soft-delete the transaction. It won't be visible but data is preserved." danger />
    </div>
  );
}
