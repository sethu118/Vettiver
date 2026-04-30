'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { updateTransaction, deleteTransaction } from '@/actions';

interface Transaction {
  id: string;
  businessId: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  referenceId: string | null;
}

export default function LedgerTable({ 
  initialTransactions, 
  businessId 
}: { 
  initialTransactions: any[]; 
  businessId: string 
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [transactions, setTransactions] = useState(initialTransactions);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [filterType, setFilterType] = useState('All');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [viewingTx, setViewingTx] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filterType === 'All' || t.type === filterType;
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (t.referenceId?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const tDateStr = t.date.includes('T') ? t.date.split('T')[0] : t.date;
      const matchesDateStart = !filterDateStart || tDateStr >= filterDateStart;
      const matchesDateEnd = !filterDateEnd || tDateStr <= filterDateEnd;
      
      return matchesType && matchesSearch && matchesDateStart && matchesDateEnd;
    });
  }, [transactions, filterType, searchTerm, filterDateStart, filterDateEnd]);

  const handleExportExcel = () => {
    const headers = ['Date', 'Description', 'Reference', 'Type', 'Amount'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.referenceId || '',
      t.type,
      t.type === 'Income' ? t.amount : -t.amount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    setIsDeleting(id);
    startTransition(async () => {
      await deleteTransaction(id, businessId);
      setTransactions(prev => prev.filter(t => t.id !== id));
      setIsDeleting(null);
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTx) return;
    
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateTransaction(editingTx.id, businessId, formData);
      const updatedTx = {
        ...editingTx,
        type: formData.get('type') as string,
        amount: parseFloat(formData.get('amount') as string),
        description: formData.get('description') as string,
        date: formData.get('date') as string,
        referenceId: formData.get('referenceId') as string || null,
      };
      setTransactions(prev => prev.map(t => t.id === editingTx.id ? updatedTx : t));
      setEditingTx(null);
    });
  };

  return (
    <div>
      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
          <label className="form-label">Search</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search descriptions..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Type</label>
          <select className="form-input" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">From</label>
          <input type="date" className="form-input" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">To</label>
          <input type="date" className="form-input" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} />
        </div>
        <button className="btn btn-secondary" onClick={handleExportExcel}>
          📊 Export Excel
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(t => (
              <tr key={t.id}>
                <td style={{ color: 'var(--text-muted)' }}>
                  {isMounted ? new Date(t.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '...'}
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#0d2b1a' }}>{t.description}</div>
                  {t.referenceId && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Ref: {t.referenceId}</div>}
                </td>
                <td>
                  <span style={{ 
                    padding: '0.35rem 0.75rem', 
                    borderRadius: '2rem', 
                    fontSize: '0.85rem', 
                    background: t.type === 'Income' ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)', 
                    color: t.type === 'Income' ? 'var(--primary)' : 'var(--danger)', 
                    fontWeight: 700 
                  }}>
                    {t.type}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: t.type === 'Income' ? 'var(--primary)' : 'var(--danger)' }}>
                  {t.type === 'Income' ? '+' : '-'} ₹{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setViewingTx(t)}>
                      View
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setEditingTx(t)}>
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} 
                      onClick={() => handleDelete(t.id)}
                      disabled={isDeleting === t.id}
                    >
                      {isDeleting === t.id ? '...' : 'Del'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
                  No transactions match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Edit Transaction</h2>
              <button onClick={() => setEditingTx(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select name="type" className="form-input" defaultValue={editingTx.type} required>
                  <option value="Income">Income (+)</option>
                  <option value="Expense">Expense (-)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (INR)</label>
                <input type="number" step="0.01" name="amount" className="form-input" defaultValue={editingTx.amount} required />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" name="date" className="form-input" defaultValue={editingTx.date.split('T')[0]} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input type="text" name="description" className="form-input" defaultValue={editingTx.description} required />
              </div>
              <div className="form-group">
                <label className="form-label">Reference # / Bill ID</label>
                <input type="text" name="referenceId" className="form-input" defaultValue={editingTx.referenceId || ''} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingTx(null)}>Cancel</button>
                <button type="submit" className="btn" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingTx && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Transaction Details</h2>
              <button onClick={() => setViewingTx(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Type</label>
                <div style={{ 
                  fontWeight: 700, 
                  color: viewingTx.type === 'Income' ? 'var(--primary)' : 'var(--danger)',
                  fontSize: '1.1rem'
                }}>
                  {viewingTx.type}
                </div>
              </div>
              <div>
                <label className="form-label">Amount</label>
                <div style={{ fontWeight: 800, fontSize: '1.5rem' }}>₹{viewingTx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div>
                <label className="form-label">Date</label>
                <div>{isMounted ? new Date(viewingTx.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '...'}</div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <div style={{ fontSize: '1.1rem' }}>{viewingTx.description}</div>
              </div>
              <div>
                <label className="form-label">Reference #</label>
                <div>{viewingTx.referenceId || '--'}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={() => setViewingTx(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
