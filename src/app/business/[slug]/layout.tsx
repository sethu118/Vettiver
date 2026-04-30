import Link from 'next/link';
import { getBusinessBySlug } from '@/actions';
import { notFound } from 'next/navigation';

export default async function BusinessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const biz = await getBusinessBySlug(slug);
  if (!biz) notFound();

  const navItems = [
    { label: 'Dashboard', href: `/business/${slug}`, icon: '📊' },
    { label: 'Profile', href: `/business/${slug}/profile`, icon: '🏢' },
    { label: 'Contacts', href: `/business/${slug}/contacts`, icon: '📇' },
    { 
      label: 'Inventory', 
      href: `/business/${slug}/inventory`, 
      icon: '📦',
      sub: [
        ...(slug !== 'chicken-farm' ? [{ label: 'Operations', href: `/business/${slug}/inventory` }] : []),
        { label: 'Product Master', href: `/business/${slug}/inventory/products` },
      ]
    },
    { 
      label: 'Accounting', 
      href: `/business/${slug}/accounting`, 
      icon: '💰',
      sub: [
        { label: 'Receivable', href: `/business/${slug}/accounting/receivable` },
        { label: 'Payable', href: `/business/${slug}/accounting/payable` },
      ]
    },
    { 
      label: 'HR & Payroll', 
      href: `/business/${slug}/hr/employees`, 
      icon: '👥',
      sub: [
        { label: 'Employee Master', href: `/business/${slug}/hr/employees` },
        { label: 'Attendance', href: `/business/${slug}/hr/attendance` },
        { label: 'Payroll', href: `/business/${slug}/hr/payroll` },
      ]
    },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div>
          <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{biz.icon}</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>{biz.name}</h2>
          <Link href="/business" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>← All Businesses</Link>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1.5rem' }}>
          {navItems.map(item => (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Link href={item.href} className="sidebar-nav-item">
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                {item.label}
              </Link>
              {item.sub && (
                <div style={{ marginLeft: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.15rem', marginBottom: '0.5rem' }}>
                  {item.sub.map(sub => (
                    <Link key={sub.href} href={sub.href} className="sidebar-nav-item" style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem', opacity: 0.85 }}>
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
