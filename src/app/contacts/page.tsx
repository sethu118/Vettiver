import { getAllContacts } from '@/actions';

export const dynamic = 'force-dynamic';

export default async function GlobalContactsPage() {
  const allContacts = await getAllContacts();

  return (
    <div className="global-page-body">
      <h1 className="page-title">Global Contacts</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>All contacts across all businesses.</p>
      {allContacts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No contacts yet. Add contacts within each business module.
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid var(--primary-light)' }}>
            <span style={{ fontSize: '1.5rem' }}>📇</span>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Master Directory</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contact Name</th>
                  <th>Department / Type</th>
                  <th>Phone Number</th>
                  <th>Email Address</th>
                </tr>
              </thead>
              <tbody>
                {allContacts.map(c => (
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
                    <td style={{ fontSize: '1rem' }}>{c.phone ? `📞 ${c.phone}` : '—'}</td>
                    <td style={{ fontSize: '1rem', color: 'var(--primary)' }}>{c.email ? `✉️ ${c.email}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
