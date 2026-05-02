import { getBusinessBySlug, getCompanyProfile, getStakeholders } from '@/actions';
import { notFound } from 'next/navigation';
import { upsertCompanyProfile, addStakeholder } from '@/actions';

export const dynamic = 'force-dynamic';

export default async function BusinessProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const biz = await getBusinessBySlug(slug);
  if (!biz) notFound();

  const profile = await getCompanyProfile(biz.id);
  const stakeList = await getStakeholders(biz.id);

  const upsertWithId = upsertCompanyProfile.bind(null, biz.id);
  const addStakeholderWithId = addStakeholder.bind(null, biz.id);

  return (
    <div className="animate-fadeIn">
      <header className="page-header">
        <h1 className="page-title">Company Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>{biz.name} — business information and stakeholders.</p>
      </header>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--primary-light)' }}>
            <span style={{ fontSize: '1.5rem' }}>🏢</span>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Business Details</h2>
          </div>
          <form action={upsertWithId} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label className="form-label">Business Name</label>
              <input type="text" name="name" className="form-input" defaultValue={profile?.name} required placeholder="e.g. Vettiver Agro Group" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label className="form-label">Established Date</label>
              <input type="date" name="established" className="form-input" defaultValue={profile?.established?.split('T')[0] || ''} />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Full Physical Address</label>
              <input type="text" name="address" className="form-input" defaultValue={profile?.address || ''} placeholder="Street, City, State, ZIP" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Business Description</label>
              <textarea name="description" className="form-input" style={{ minHeight: '120px' }} defaultValue={profile?.description || ''} placeholder="Briefly describe your business operations..."></textarea>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn" style={{ padding: '0.75rem 2.5rem' }}>Save Business Profile</button>
            </div>
          </form>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--primary-light)' }}>
            <span style={{ fontSize: '1.5rem' }}>👥</span>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Stakeholders & Partners</h2>
          </div>
          
          {!profile ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fff1f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
              <p style={{ color: '#be123c', fontWeight: 600 }}>⚠️ Please save the business profile details above before adding stakeholders.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Add New Stakeholder</h3>
                <form action={addStakeholderWithId} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                  <div className="form-group"><label className="form-label">Full Name</label><input type="text" name="name" className="form-input" required /></div>
                  <div className="form-group"><label className="form-label">Designation / Role</label><input type="text" name="role" className="form-input" required /></div>
                  <div className="form-group"><label className="form-label">Activity History</label><textarea name="history" className="form-input" style={{ minHeight: '80px' }}></textarea></div>
                  <button type="submit" className="btn btn-secondary">Add Stakeholder</button>
                </form>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Stakeholder Directory</h3>
                {stakeList.length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed var(--surface-border)', borderRadius: 'var(--radius-md)' }}>No stakeholders listed yet.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {stakeList.map(s => (
                      <div key={s.id} style={{ padding: '1.25rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '1.2rem', color: '#0d2b1a' }}>{s.name}</strong>
                          <span style={{ padding: '0.25rem 0.75rem', background: '#dcfce7', color: '#15803d', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>{s.role}</span>
                        </div>
                        {s.history && <p style={{ fontSize: '1rem', color: '#4b7c5e', marginTop: '0.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '0.5rem' }}>{s.history}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
