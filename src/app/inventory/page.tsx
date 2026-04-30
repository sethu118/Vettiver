import { getInventory, getLandOperations, addInventory, addLandOperation } from "@/actions";
import InventoryExportButton from "./ExportButton";

export default async function InventoryPage() {
  const inventory = await getInventory();
  const landOps = await getLandOperations();

  return (
    <div className="animate-fadeIn">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Operations & Inventory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track your land size, bag availability, and production forecasts.</p>
        </div>
        <InventoryExportButton inventory={inventory} landOps={landOps} />
      </header>

      <div className="card-grid" style={{ marginBottom: '2rem' }}>
        {/* Land Operations Section */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Land Operations</h2>
          <form action={addLandOperation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Location / Plot Name</label>
              <input type="text" name="location" className="form-input" placeholder="e.g. North Field" required />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Size</label>
                <input type="number" step="0.01" name="size" className="form-input" required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Unit</label>
                <select name="unit" className="form-input" required>
                  <option value="Acres">Acres</option>
                  <option value="Hectares">Hectares</option>
                  <option value="Perches">Perches</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Crop Status</label>
              <input type="text" name="cropStatus" className="form-input" placeholder="e.g. Planting, Growing, Harvested" />
            </div>
            <div className="form-group">
              <label className="form-label">Forecast Planning</label>
              <textarea name="forecast" className="form-input" placeholder="Predicted yield, timeline, etc."></textarea>
            </div>
            <button type="submit" className="btn">Record Land Operation</button>
          </form>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Size</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {landOps.map(op => (
                  <tr key={op.id}>
                    <td>{op.location}</td>
                    <td>{op.size} {op.unit}</td>
                    <td>{op.cropStatus || 'N/A'}</td>
                  </tr>
                ))}
                {landOps.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No land operations recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bag Inventory Section */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Inventory Tracking</h2>
          <form action={addInventory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input type="text" name="productName" className="form-input" defaultValue="Vettiver Bags" required />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Quantity</label>
                <input type="number" name="quantity" className="form-input" required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Unit</label>
                <input type="text" name="unit" className="form-input" defaultValue="bags" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea name="notes" className="form-input"></textarea>
            </div>
            <button type="submit" className="btn">Update Inventory</button>
          </form>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.quantity} {item.unit}</td>
                    <td style={{ fontSize: '0.75rem' }}>{new Date(item.lastUpdated).toLocaleDateString()}</td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Empty inventory.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
