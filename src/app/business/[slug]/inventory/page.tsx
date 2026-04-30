import { getBusinessBySlug, getInventory, getLandOperations, addInventory, addLandOperation } from '@/actions';
import { notFound } from 'next/navigation';

export default async function BusinessInventoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const biz = await getBusinessBySlug(slug);
  if (!biz) notFound();

  const inventoryList = await getInventory(biz.id);
  const landList = await getLandOperations(biz.id);

  const addInvWithId = addInventory.bind(null, biz.id);
  const addLandWithId = addLandOperation.bind(null, biz.id);

  return (
    <div className="animate-fadeIn">
      <header className="page-header">
        <h1 className="page-title">Inventory & Operations</h1>
        <p style={{ color: 'var(--text-muted)' }}>{biz.name} — stock, land, and production forecasts.</p>
      </header>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        {/* Land Operations Section - Hidden for Chicken Farm */}
        {slug !== 'chicken-farm' && (
          <section style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--primary-light)' }}>
              <span style={{ fontSize: '1.5rem' }}>🗺️</span>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Field & Land Operations</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Record Operation</h3>
                <form action={addLandWithId} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                  <div className="form-group"><label className="form-label">Location / Plot Name</label><input type="text" name="location" className="form-input" required placeholder="e.g. North Field" /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group"><label className="form-label">Size</label><input type="number" step="0.01" name="size" className="form-input" required /></div>
                    <div className="form-group"><label className="form-label">Unit</label>
                      <select name="unit" className="form-input">
                        <option value="Acres">Acres</option>
                        <option value="Hectares">Hectares</option>
                        <option value="Perches">Perches</option>
                        <option value="sq.ft">sq.ft</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group"><label className="form-label">Crop / Land Status</label><input type="text" name="cropStatus" className="form-input" placeholder="e.g. Growing, Fallow" /></div>
                  <div className="form-group"><label className="form-label">Growth Forecast / Notes</label><textarea name="forecast" className="form-input" style={{ minHeight: '80px' }}></textarea></div>
                  <button type="submit" className="btn">Record Land Stat</button>
                </form>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Operation Registry</h3>
                {landList.length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed var(--surface-border)', borderRadius: 'var(--radius-md)' }}>No field records yet.</p>
                ) : (
                  <table className="data-table">
                    <thead><tr><th>Location</th><th>Size</th><th>Status</th></tr></thead>
                    <tbody>{landList.map(op => <tr key={op.id}><td>{op.location}</td><td>{op.size} {op.unit}</td><td><span style={{ fontWeight: 600 }}>{op.cropStatus || '—'}</span></td></tr>)}</tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Stock Inventory Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--primary-light)' }}>
            <span style={{ fontSize: '1.5rem' }}>📦</span>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Stock Inventory</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Update Stock</h3>
              <form action={addInvWithId} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                <div className="form-group"><label className="form-label">Product Name</label><input type="text" name="productName" className="form-input" required placeholder="e.g. Fertilizer, Seedling" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group"><label className="form-label">Quantity</label><input type="number" name="quantity" className="form-input" required /></div>
                  <div className="form-group"><label className="form-label">Unit</label><input type="text" name="unit" className="form-input" placeholder="bags, kg, etc." required /></div>
                </div>
                <div className="form-group"><label className="form-label">Storage Notes</label><textarea name="notes" className="form-input" style={{ minHeight: '80px' }}></textarea></div>
                <button type="submit" className="btn btn-secondary">Update Inventory</button>
              </form>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Inventory Ledger</h3>
              {inventoryList.length === 0 ? (
                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed var(--surface-border)', borderRadius: 'var(--radius-md)' }}>No stock records yet.</p>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Product Item</th><th style={{ textAlign: 'right' }}>Current Qty</th><th style={{ textAlign: 'right' }}>Last Update</th></tr></thead>
                  <tbody>
                    {inventoryList.map(item => (
                      <tr key={item.id}>
                        <td>{item.productName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{item.quantity} {item.unit}</td>
                        <td style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(item.lastUpdated).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
