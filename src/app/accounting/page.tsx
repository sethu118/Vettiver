import { getAllTransactions } from "@/actions";
import ExportButton from "./ExportButton";

export const dynamic = 'force-dynamic';

export default async function AccountingPage() {
  const transactions = await getAllTransactions();

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  return (
    <div className="animate-fadeIn">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Accounting & Finance</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage receipts, payments, and financial ledgers.</p>
        </div>
        <ExportButton transactions={transactions} totalBalance={totalBalance} />
      </header>

      <div>
        {/* Ledger */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Financial Ledger</h2>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Net Balance</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: totalBalance >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                INR {totalBalance.toLocaleString()}
              </div>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td style={{ fontSize: '0.875rem' }}>{new Date(t.date).toLocaleDateString()}</td>
                  <td>
                    <div>{t.description}</div>
                    {t.referenceId && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ref: {t.referenceId}</div>}
                  </td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem',
                      background: t.type === 'Income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: t.type === 'Income' ? 'var(--primary)' : 'var(--danger)',
                      fontWeight: 600
                    }}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: t.type === 'Income' ? 'var(--primary)' : 'var(--danger)' }}>
                    {t.type === 'Income' ? '+' : '-'}{t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
