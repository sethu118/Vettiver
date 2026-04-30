import { getBusinessBySlug, getEmployees } from '@/actions';
import { notFound } from 'next/navigation';
import EmployeeForm from '@/components/hr/EmployeeForm';
import Link from 'next/link';

export default async function EmployeeMasterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const biz = await getBusinessBySlug(slug);
  if (!biz) notFound();

  const employeeList = await getEmployees(biz.id);

  return (
    <div className="animate-fadeIn">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">👥 Employee Master</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>Manage workforce records and payroll configurations for {biz.name}.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href={`/business/${slug}/hr/attendance`} className="btn btn-secondary">Attendance Grid →</Link>
          <Link href={`/business/${slug}/hr/payroll`} className="btn btn-secondary">Payroll Hub →</Link>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 2fr', gap: '2.5rem' }}>
        {/* Registration Form */}
        <div>
          <EmployeeForm bizId={biz.id} slug={slug} />
        </div>

        {/* Employee List */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
            Registered Workforce ({employeeList.length})
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Sex/Age</th>
                  <th>Location</th>
                  <th>Wages</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {employeeList.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No employees registered yet. Use the form to add workforce.
                    </td>
                  </tr>
                ) : (
                  employeeList.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>📞 {emp.phone || 'No phone'}</div>
                      </td>
                      <td>
                        <div>{emp.sex || '-'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{emp.age ? `${emp.age} years` : '-'}</div>
                      </td>
                      <td style={{ fontSize: '0.9rem' }}>{emp.location || 'N/A'}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>₹{emp.wages.toLocaleString()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OT: ₹{emp.wagesPerHour}/hr</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ 
                          padding: '0.25rem 0.6rem', 
                          borderRadius: '1rem', 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          background: emp.status === 'Active' ? 'var(--primary-light)' : '#f3f4f6',
                          color: emp.status === 'Active' ? 'var(--primary)' : '#666'
                        }}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
