import { getAllCompanyProfiles } from "@/actions";

export const dynamic = 'force-dynamic';

export default async function CompanyPage() {
  const profiles = await getAllCompanyProfiles();

  return (
    <div className="animate-fadeIn">
      <header className="page-header">
        <h1 className="page-title">Company Profiles</h1>
        <p style={{ color: 'var(--text-muted)' }}>Overview of all registered business profiles.</p>
      </header>

      {profiles.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No profiles yet. Set up a company profile within each business module.
        </div>
      ) : (
        <div className="card-grid">
          {profiles.map(p => (
            <div key={p.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>{p.name}</h2>
              {p.description && <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{p.description}</p>}
              {p.address && <p style={{ fontSize: '0.875rem' }}>📍 {p.address}</p>}
              {p.established && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Est. {p.established}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
