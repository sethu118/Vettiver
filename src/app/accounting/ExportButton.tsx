'use client';

import { exportLedgerToPDF } from '@/utils/pdfExport';

export default function ExportButton({ transactions, totalBalance }: { transactions: any[]; totalBalance: number }) {
  return (
    <button
      className="btn btn-secondary"
      onClick={() => exportLedgerToPDF(transactions, totalBalance)}
    >
      📄 Export Ledger PDF
    </button>
  );
}
