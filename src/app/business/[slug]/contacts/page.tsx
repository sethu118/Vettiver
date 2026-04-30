import { getBusinessBySlug, getContacts, addContact } from '@/actions';
import { notFound } from 'next/navigation';

export default async function BusinessContactsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const biz = await getBusinessBySlug(slug);
  if (!biz) notFound();

  const contactList = await getContacts(biz.id);
  const addContactWithId = addContact.bind(null, biz.id);

  return (
    <div className="animate-fadeIn">
      <header className="page-header">
        <h1 className="page-title">Contacts</h1>
        <p style={{ color: 'var(--text-muted)' }}>{biz.name} — business contacts directory.</p>
      </header>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--primary-light)' }}>
            <span style={{ fontSize: '1.5rem' }}>➕</span>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Create New Contact</h2>
          </div>
          <form action={addContactWithId} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input" required placeholder="e.g. Ramesh Kumar" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label className="form-label">Contact Type</label>
              <select name="type" className="form-input" required>
                <option value="Operational">Operational</option>
                <option value="Accounting">Accounting</option>
                <option value="Marketing">Marketing</option>
                <option value="General">General</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="text" name="phone" className="form-input" placeholder="+91 00000 00000" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" className="form-input" placeholder="example@business.com" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Additional Notes</label>
              <textarea name="notes" className="form-input" style={{ minHeight: '80px' }} placeholder="Notes about this contact..."></textarea>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn" style={{ padding: '0.75rem 2.5rem' }}>Save to Directory</button>
            </div>
          </form>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--primary-light)' }}>
            <span style={{ fontSize: '1.5rem' }}>📇</span>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Business Directory ({contactList.length})</h2>
          </div>
          
          {contactList.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              No contacts listed for this business yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Contact Name</th>
                    <th>Type</th>
                    <th>Contact Info</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {contactList.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0d2b1a' }}>{c.name}</div>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '0.35rem 0.8rem', 
                          background: '#dcfce7', 
                          color: '#15803d', 
                          borderRadius: '1rem', 
                          fontSize: '0.85rem', 
                          fontWeight: 700 
                        }}>
                          {c.type}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {c.phone && <div style={{ fontSize: '1rem' }}>📞 {c.phone}</div>}
                          {c.email && <div style={{ fontSize: '1rem', color: 'var(--primary)' }}>✉️ {c.email}</div>}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.95rem', color: '#4b7c5e', maxWidth: '300px' }}>
                        {c.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
