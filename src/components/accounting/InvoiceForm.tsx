'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createInvoice } from '@/actions';

interface Product {
  id: string;
  name: string;
  uom: string;
  basePrice: number;
}

interface Contact {
  id: string;
  name: string;
}

interface LineItem {
  id: string;
  productId: string;
  description: string;
  quantity: number;
  uom: string;
  rate: number;
  total: number;
}

export default function InvoiceForm({ 
  bizId, 
  slug, 
  type, 
  contacts, 
  products 
}: { 
  bizId: string; 
  slug: string; 
  type: 'Receivable' | 'Payable';
  contacts: Contact[];
  products: Product[];
}) {
  const router = useRouter();
  const [partyId, setPartyId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), productId: '', description: '', quantity: 1, uom: 'kg', rate: 0, total: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), productId: '', description: '', quantity: 1, uom: 'kg', rate: 0, total: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: string, value: any) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        
        // If product changes, auto-fill description, UOM, and rate
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            newItem.description = product.name;
            newItem.uom = product.uom;
            newItem.rate = product.basePrice;
          }
        }
        
        // Ensure quantity and rate are valid numbers for calculation
        const q = isNaN(newItem.quantity) ? 0 : newItem.quantity;
        const r = isNaN(newItem.rate) ? 0 : newItem.rate;
        newItem.total = q * r;
        return newItem;
      }
      return item;
    });
    setItems(updated);
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyId) return alert('Please select a Billing Party');
    
    setIsSubmitting(true);
    try {
      const data = { partyId, date, location, notes, totalAmount: grandTotal };
      await createInvoice(bizId, type, data, items);
      router.push(`/business/${slug}/accounting/${type.toLowerCase()}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fadeIn">
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">{type === 'Receivable' ? 'Billing Party' : 'Supplier'}</label>
            <select 
              className="form-input" 
              value={partyId} 
              onChange={(e) => setPartyId(e.target.value)} 
              required
            >
              <option value="">Select Party</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Invoice Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input 
              className="form-input" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              placeholder="e.g. Main Godown / Field A" 
            />
          </div>
        </div>

        {/* Line Items Grid */}
        <div style={{ marginTop: '2.5rem' }}>
          <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📦 Product Information</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
              <thead>
                <tr style={{ background: 'transparent' }}>
                  <th style={{ width: '40px' }}>Sr.</th>
                  <th style={{ width: '250px' }}>Product / Description</th>
                  <th style={{ width: '100px' }}>Qty</th>
                  <th style={{ width: '100px' }}>UOM</th>
                  <th style={{ width: '120px' }}>Rate (₹)</th>
                  <th style={{ width: '150px' }}>Total (₹)</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="glass-panel" style={{ borderRadius: '0.5rem' }}>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <select 
                          className="form-input" 
                          style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                          value={item.productId}
                          onChange={(e) => updateItem(item.id, 'productId', e.target.value)}
                        >
                          <option value="">-- Select Product --</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          <option value="custom">Other / Manual</option>
                        </select>
                        <input 
                          className="form-input" 
                          style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Short description..."
                        />
                      </div>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className="form-input" 
                        style={{ padding: '0.4rem' }}
                        value={isNaN(item.quantity) ? '' : item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                        min="0.01"
                        step="0.01"
                      />
                    </td>
                    <td>
                      <input 
                        className="form-input" 
                        style={{ padding: '0.4rem' }}
                        value={item.uom}
                        onChange={(e) => updateItem(item.id, 'uom', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className="form-input" 
                        style={{ padding: '0.4rem' }}
                        value={isNaN(item.rate) ? '' : item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value))}
                        step="0.01"
                      />
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--primary)', textAlign: 'right', paddingRight: '1rem' }}>
                      ₹{item.total.toLocaleString()}
                    </td>
                    <td>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(item.id)} style={{ padding: '0.25rem 0.5rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.25rem' }}>
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button 
            type="button" 
            onClick={addItem} 
            className="btn-secondary" 
            style={{ marginTop: '1rem', width: '100%', borderStyle: 'dashed', borderRadius: '0.75rem' }}
          >
            + Add Line Item
          </button>
        </div>

        {/* Footer / Summary */}
        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--surface-border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ width: '400px' }}>
            <label className="form-label">Notes / Terms</label>
            <textarea 
              className="form-input" 
              rows={3} 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Payment due in 15 days..."
            />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Total Amount Due</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
              ₹{grandTotal.toLocaleString()}
            </div>
            <button 
              type="submit" 
              className="btn" 
              style={{ marginTop: '1.5rem', padding: '1rem 3rem', fontSize: '1.25rem', borderRadius: '3rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : `Confirm ${type} Invoice`}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
