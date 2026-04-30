import { getBusinessBySlug, getProducts, addProduct } from '@/actions';
import { notFound } from 'next/navigation';

export default async function ProductMasterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const biz = await getBusinessBySlug(slug);
  if (!biz) notFound();

  const productsUnderBiz = await getProducts(biz.id);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">📦 Product Master</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Define and manage products for {biz.name}.
        </p>
      </div>

      <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Product List */}
        <section className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.25rem' }}>Current Products</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>UOM</th>
                  <th>Base Rate</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {productsUnderBiz.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No products defined yet.
                    </td>
                  </tr>
                ) : (
                  productsUnderBiz.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td><span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem' }}>{p.uom}</span></td>
                      <td style={{ fontWeight: 700 }}>₹{p.basePrice?.toLocaleString() || 0}</td>
                      <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{p.description || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Add Product Form */}
        <section className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.25rem' }}>New Product</h2>
          <form action={async (fd) => {
            'use server';
            await addProduct(biz.id, fd);
          }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input name="name" className="form-input" placeholder="e.g. Vetiver Roots" required />
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure (UOM)</label>
              <select name="uom" className="form-input" required>
                <option value="kg">kg</option>
                <option value="Bags">Bags</option>
                <option value="Bundles">Bundles</option>
                <option value="Liters">Liters</option>
                <option value="Units">Units</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Base Rate (₹)</label>
              <input name="basePrice" type="number" step="0.01" className="form-input" placeholder="0.00" required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-input" rows={3} placeholder="Optional details..." />
            </div>
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '0.5rem' }}>
              Add to Master
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
