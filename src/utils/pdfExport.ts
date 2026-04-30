'use client';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const jsPDF = require('jspdf');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('jspdf-autotable');

export function exportLedgerToPDF(transactions: any[], totalBalance: number) {
  const doc = new jsPDF.jsPDF();

  doc.setFontSize(20);
  doc.text('Vettiver Financial Ledger', 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Net Balance: INR ${totalBalance.toLocaleString()}`, 14, 36);

  const tableData = transactions.map((t: any) => [
    new Date(t.date).toLocaleDateString(),
    t.description,
    t.type,
    `${t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString()}`,
  ]);

  doc.autoTable({
    startY: 45,
    head: [['Date', 'Description', 'Type', 'Amount (INR)']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
  });

  doc.save('vettiver-ledger.pdf');
}

export function exportInventoryToPDF(inventory: any[], landOps: any[]) {
  const doc = new jsPDF.jsPDF();

  doc.setFontSize(20);
  doc.text('Vettiver Operations Summary', 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Land Operations', 14, 45);

  const landData = landOps.map((op: any) => [
    op.location,
    `${op.size} ${op.unit}`,
    op.cropStatus || 'N/A',
    op.forecast || '',
  ]);

  doc.autoTable({
    startY: 50,
    head: [['Location', 'Size', 'Status', 'Forecast']],
    body: landData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Inventory Status', 14, finalY + 15);

  const invData = inventory.map((item: any) => [
    item.productName,
    `${item.quantity} ${item.unit}`,
    new Date(item.lastUpdated).toLocaleDateString(),
  ]);

  doc.autoTable({
    startY: finalY + 20,
    head: [['Product', 'Quantity', 'Last Updated']],
    body: invData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
  });

  doc.save('vettiver-operations.pdf');
}
