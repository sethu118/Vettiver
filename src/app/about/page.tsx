import { getBusinesses } from '@/actions';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const bizList = await getBusinesses();

  return (
    <div className="global-page-body">
      <h1 className="page-title">About Us</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '680px' }}>
        We are a diversified business group with operations spanning agriculture, poultry farming, and timber processing.
        Our businesses are united by a commitment to sustainable practices, quality, and community growth.
      </p>

      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--primary-light)' }}>
          <span style={{ fontSize: '1.5rem' }}>🤝</span>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Our Business Group</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {bizList.map(biz => (
            <div key={biz.id} className="glass-panel" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: biz.color || 'var(--primary)' }}></div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{biz.icon}</div>
              <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#15803d', marginBottom: '0.75rem' }}>{biz.name}</h3>
              <p style={{ fontSize: '1rem', color: '#4b7c5e', lineHeight: 1.6 }}>{biz.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
