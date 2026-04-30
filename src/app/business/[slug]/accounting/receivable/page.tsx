import { getBusinessBySlug, getInvoices, getContacts, getProducts } from '@/actions';
import { notFound } from 'next/navigation';
import InvoiceForm from '@/components/accounting/InvoiceForm';
import Link from 'next/link';

export default async function ReceivablePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ action?: string }>;
}) {
  const { slug } = await params;
  const { action } = await searchParams;
  const biz = await getBusinessBySlug(slug);
  if (!biz) notFound();

  const invoicesList = await getInvoices(biz.id, 'Receivable');
  const contactsUnderBiz = await getContacts(biz.id);
  const productsUnderBiz = await getProducts(biz.id);

  const isCreating = action === 'new';

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">🤝 Receivables (Sales)</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Manage sale entries and generate invoices for {biz.name}.
          </p>
        </div>
        {!isCreating && (
          <Link href={`/business/${slug}/accounting/receivable?action=new`} className="btn">
            + Record New Sale
          </Link>
        )}
        {isCreating && (
          <Link href={`/business/${slug}/accounting/receivable`} className="btn-secondary">
            ← Back to List
          </Link>
        )}
      </div>

      {isCreating ? (
        <InvoiceForm 
          bizId={biz.id} 
          slug={slug} 
          type="Receivable" 
          contacts={contactsUnderBiz.map(c => ({ id: c.id, name: c.name }))} 
          products={productsUnderBiz.map(p => ({ id: p.id, name: p.name, uom: p.uom, basePrice: p.basePrice }))} 
        />
      ) : (
        <section className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Inv. No.</th>
                  <th>Date</th>
                  <th>Billing Party</th>
                  <th>Location</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoicesList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No sale entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  invoicesList.map((inv) => {
                    const partyName = contactsUnderBiz.find(c => c.id === inv.partyId)?.name || 'Unknown';
                    return (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 700 }}>{inv.invoiceNumber}</td>
                        <td>{inv.date}</td>
                        <td style={{ fontWeight: 600 }}>{partyName}</td>
                        <td style={{ fontSize: '0.9rem' }}>{inv.location || '-'}</td>
                        <td style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{inv.totalAmount.toLocaleString()}</td>
                        <td>
                          <span style={{ 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '1rem', 
                            fontSize: '0.75rem', 
                            fontWeight: 700,
                            background: inv.status === 'Confirmed' ? 'var(--primary-light)' : '#fef3c7',
                            color: inv.status === 'Confirmed' ? 'var(--primary)' : '#d97706'
                          }}>
                            {inv.status}
                          </span>
                        </td>
                        <td>
                          <Link 
                            href={`/business/${slug}/accounting/invoice/${inv.id}`} 
                            style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}
                          >
                            View Invoice →
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
