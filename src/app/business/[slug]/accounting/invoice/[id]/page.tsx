import { getInvoiceById, getBusinessBySlug } from '@/actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PrintButton from '@/components/accounting/PrintButton';

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const biz = await getBusinessBySlug(slug);
  const invoice = await getInvoiceById(id);

  if (!biz || !invoice) notFound();

  return (
    <div className="animate-fadeIn">
      <div className="no-print" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href={`/business/${slug}/accounting/${invoice.type.toLowerCase()}`} style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
          ← Back to {invoice.type}s
        </Link>
        <PrintButton />
      </div>

      {/* Printable Invoice Area */}
      <div className="glass-panel" style={{ 
        padding: '3rem', 
        background: '#fff', 
        color: '#000', 
        minHeight: '800px',
        boxShadow: '0 0 20px rgba(0,0,0,0.05)',
        border: '1px solid #eee'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #16a34a', paddingBottom: '2rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{biz.icon}</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#16a34a', margin: 0 }}>{biz.name}</h1>
            <p style={{ color: '#666', margin: '0.25rem 0' }}>{biz.description || 'Agriculture & Allied Services'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#eee', margin: 0 }}>{invoice.type.toUpperCase()}</h2>
            <div style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
              <div style={{ fontWeight: 800 }}>Invoice #: {invoice.invoiceNumber}</div>
              <div style={{ color: '#666' }}>Date: {invoice.date}</div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '4rem' }}>
          <div>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              {invoice.type === 'Receivable' ? 'BILL TO' : 'SUPPLIER'}
            </h3>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#000' }}>{invoice.party?.name}</div>
            <div style={{ color: '#444', marginTop: '0.5rem', lineHeight: '1.6' }}>
              {invoice.party?.phone && <div>📞 {invoice.party.phone}</div>}
              {invoice.party?.email && <div>✉️ {invoice.party.email}</div>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              SHIPPING / LOCATION
            </h3>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{invoice.location || 'N/A'}</div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ textAlign: 'left', padding: '1rem 0', color: '#666' }}>Description</th>
              <th style={{ textAlign: 'center', padding: '1rem 0', color: '#666' }}>Quantity</th>
              <th style={{ textAlign: 'center', padding: '1rem 0', color: '#666' }}>UOM</th>
              <th style={{ textAlign: 'right', padding: '1rem 0', color: '#666' }}>Rate</th>
              <th style={{ textAlign: 'right', padding: '1rem 1rem', color: '#666', background: '#f9f9f9' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: any) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1.25rem 0', fontWeight: 600 }}>{item.description}</td>
                <td style={{ padding: '1.25rem 0', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '1.25rem 0', textAlign: 'center' }}><span style={{ color: '#666', fontSize: '0.9rem' }}>{item.uom}</span></td>
                <td style={{ padding: '1.25rem 0', textAlign: 'right' }}>₹{item.rate.toLocaleString()}</td>
                <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: 800, background: '#f9f9f9' }}>₹{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
              <span style={{ color: '#666' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{invoice.totalAmount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', marginTop: '1rem', background: '#16a34a', color: '#fff', borderRadius: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>GRAND TOTAL</span>
              <span style={{ fontWeight: 900, fontSize: '1.25rem' }}>₹{invoice.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '6rem', paddingTop: '2rem', borderTop: '1px solid #eee', color: '#888', fontSize: '0.85rem', textAlign: 'center' }}>
          <p>This is a system-generated document. No signature required.</p>
          <div style={{ marginTop: '0.5rem', fontWeight: 700, color: '#16a34a' }}>{biz.name} — Agriculture & Allied Business Management</div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .main-content { padding: 0 !important; }
          .sidebar { display: none !important; }
          .top-nav { display: none !important; }
          .glass-panel { border: none !important; box-shadow: none !important; padding: 0 !important; }
        }
      `}} />
    </div>
  );
}
