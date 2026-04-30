import { getBusinessBySlug, getTransactions, addTransaction } from '@/actions';
import { notFound } from 'next/navigation';
import LedgerTable from './LedgerTable';

export default async function BusinessAccountingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const biz = await getBusinessBySlug(slug);
  if (!biz) notFound();

  const txList = await getTransactions(biz.id);
  const addTxWithId = addTransaction.bind(null, biz.id);

  const totalIncome = txList.filter(t => t.type === 'Income').reduce((a, c) => a + c.amount, 0);
  const totalExpense = txList.filter(t => t.type === 'Expense').reduce((a, c) => a + c.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="animate-fadeIn">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Accounting</h1>
          <p style={{ color: 'var(--text-muted)' }}>{biz.name} — income, expenses, and ledger.</p>
        </div>
      </header>
      {/* Summary Metrics */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Income</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>₹{totalIncome.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Expenses</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)' }}>₹{totalExpense.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ background: netBalance >= 0 ? 'rgba(22,163,74,0.05)' : 'rgba(239,68,68,0.05)', borderColor: netBalance >= 0 ? 'var(--primary-light)' : '#fecaca' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Net Balance</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: netBalance >= 0 ? 'var(--primary)' : 'var(--danger)' }}>₹{netBalance.toLocaleString()}</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--primary-light)' }}>
            <span style={{ fontSize: '1.5rem' }}>📥</span>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Record Entry</h2>
          </div>
          <form action={addTxWithId} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <select name="type" className="form-input" required>
                <option value="Income">Income (+)</option>
                <option value="Expense">Expense (-)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (INR)</label>
              <input type="number" step="0.01" name="amount" className="form-input" required placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" name="date" className="form-input" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <input type="text" name="description" className="form-input" required placeholder="Describe the transaction..." />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label className="form-label">Reference # / Bill ID</label>
              <input type="text" name="referenceId" className="form-input" placeholder="Optional reference" />
            </div>
            <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn" style={{ padding: '0.75rem 2.5rem' }}>Post Transaction</button>
            </div>
          </form>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--primary-light)' }}>
            <span style={{ fontSize: '1.5rem' }}>📜</span>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Financial Ledger</h2>
          </div>
          <LedgerTable initialTransactions={txList} businessId={biz.id} />
        </section>
      </div>
    </div>
  );
}
