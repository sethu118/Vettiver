import { getBusinessBySlug, getCompanyProfile, getTransactions, getInventory, getInvoices } from '@/actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function BusinessDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const biz = await getBusinessBySlug(slug);
  if (!biz) notFound();

  const profile = await getCompanyProfile(biz.id);
  const txs = await getTransactions(biz.id);
  const inv = await getInventory(biz.id);
  const receivables = await getInvoices(biz.id, 'Receivable');
  const payables = await getInvoices(biz.id, 'Payable');

  const totalBags = inv.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalIncome = txs.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = txs.filter(t => t.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const totalReceivable = receivables.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalPayable = payables.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="animate-fadeIn">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '2rem' }}>{biz.icon}</span>
          <h1 className="page-title">{biz.name}</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>{biz.description}</p>
      </header>

      <div className="card-grid">
        <div className="dashboard-card glass-panel">
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</h3>
          <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{profile ? profile.name : <Link href={`/business/${slug}/profile`} style={{ color: 'var(--primary)' }}>Setup Profile →</Link>}</p>
        </div>
        <div className="dashboard-card glass-panel">
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Inventory</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{totalBags.toLocaleString()} units</p>
        </div>
        <div className="dashboard-card glass-panel">
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Balance</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: netBalance >= 0 ? 'var(--primary)' : 'var(--danger)' }}>₹{netBalance.toLocaleString()}</p>
        </div>
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <h2 className="section-title" style={{ fontSize: '1.25rem' }}>📈 Reports & Analytics</h2>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Receivables</h4>
              <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.25rem' }}>₹{totalReceivable.toLocaleString()}</p>
              <Link href={`/business/${slug}/accounting/receivable`} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>View Sales →</Link>
            </div>
            <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Payables</h4>
              <p style={{ color: '#b45309', fontWeight: 800, fontSize: '1.25rem' }}>₹{totalPayable.toLocaleString()}</p>
              <Link href={`/business/${slug}/accounting/payable`} style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>View Purchases →</Link>
            </div>
            <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Inventory Value</h4>
              <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: '1.25rem' }}>{inv.length} Records</p>
              <Link href={`/business/${slug}/inventory`} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Full Stock →</Link>
            </div>
            <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cash Flow</h4>
              <p style={{ color: netBalance >= 0 ? 'var(--primary)' : 'var(--danger)', fontWeight: 800, fontSize: '1.25rem' }}>{txs.length} TXs</p>
              <Link href={`/business/${slug}/accounting`} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Detailed Ledger →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
