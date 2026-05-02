import { getAllInventory, getAllLandOperations } from "@/actions";
import InventoryExportButton from "./ExportButton";

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const inventory = await getAllInventory();
  const landOps = await getAllLandOperations();

  return (
    <div className="animate-fadeIn">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Operations & Inventory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Overview of land operations and inventory across all businesses.</p>
        </div>
        <InventoryExportButton inventory={inventory} landOps={landOps} />
      </header>

      <div className="card-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Land Operations</h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
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

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Inventory Tracking</h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
