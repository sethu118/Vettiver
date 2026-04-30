'use client';

import { exportInventoryToPDF } from '@/utils/pdfExport';

export default function InventoryExportButton({ inventory, landOps }: { inventory: any[]; landOps: any[] }) {
  return (
    <button
      className="btn btn-secondary"
      onClick={() => exportInventoryToPDF(inventory, landOps)}
    >
      📄 Export Operations PDF
    </button>
  );
}
