import { getCompanyProfile, getStakeholders, upsertCompanyProfile, addStakeholder } from "@/actions";

export default async function CompanyPage() {
  const profile = await getCompanyProfile();
  const stakeholders = await getStakeholders();

  return (
    <div className="animate-fadeIn">
      <header className="page-header">
        <h1 className="page-title">Company Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your business information and stakeholders.</p>
      </header>

      <div className="card-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Business Details</h2>
          <form action={upsertCompanyProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input type="text" name="name" className="form-input" defaultValue={profile?.name} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-input" defaultValue={profile?.description || ''}></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input type="text" name="address" className="form-input" defaultValue={profile?.address || ''} />
            </div>
            <div className="form-group">
              <label className="form-label">Established Date</label>
              <input type="date" name="established" className="form-input" defaultValue={profile?.established?.split('T')[0] || ''} />
            </div>
            <button type="submit" className="btn">Save Profile</button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Stakeholders</h2>
          {!profile ? (
            <p style={{ color: 'var(--danger)' }}>Please save the company profile first to add stakeholders.</p>
          ) : (
            <>
              <form action={addStakeholder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
                <div className="form-group">
                  <label className="form-label">Stakeholder Name</label>
                  <input type="text" name="name" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input type="text" name="role" className="form-input" placeholder="e.g. Partner, Investor" required />
                </div>
                <div className="form-group">
                  <label className="form-label">History / Notes</label>
                  <textarea name="history" className="form-input" placeholder="Involvement details"></textarea>
                </div>
                <button type="submit" className="btn btn-secondary">Add Stakeholder</button>
              </form>

              <div>
                {stakeholders.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No stakeholders added yet.</p> : (
                  <ul style={{ listStyle: 'none' }}>
                    {stakeholders.map(s => (
                      <li key={s.id} style={{ padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem', border: '1px solid var(--surface-border)' }}>
                        <strong>{s.name}</strong> - <span style={{ color: 'var(--text-muted)' }}>{s.role}</span>
                        {s.history && <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{s.history}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
