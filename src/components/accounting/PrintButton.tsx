'use client';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="btn"
      style={{ padding: '0.6rem 2rem' }}
    >
      🖨️ Print Invoice
    </button>
  );
}
