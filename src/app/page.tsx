import { getBusinesses } from '@/actions';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GlobalHomePage() {
  const bizList = await getBusinesses();

  return (
    <div>
      {/* Hero */}
      <section className="hero-section">
        <Image src="/hero.png" alt="Our businesses" fill style={{ objectFit: 'cover', objectPosition: 'center 40%' }} priority />
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-tag">🌱 Multi-Business Management Portal</span>
          <h1 className="hero-title">Welcome to Business Hub</h1>
          <p className="hero-subtitle">Manage all your businesses from one place — operations, inventory, accounting, and contacts.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <Link href="/business" className="hero-btn-primary">View Businesses</Link>
            <Link href="/about" className="hero-btn-secondary">About Us</Link>
          </div>
        </div>
        <div className="hero-fade-bottom" />
      </section>

      {/* Business Cards */}
      <div className="home-body">
        <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>Our Businesses</h2>
        <div className="biz-grid">
          {bizList.map(biz => (
            <Link 
              href={`/business/${biz.slug}`} 
              key={biz.id} 
              className="biz-card" 
              style={{ '--biz-color': biz.color } as any}
            >
              <div className="biz-card-icon">{biz.icon}</div>
              <div className="biz-card-body">
                <h3>{biz.name}</h3>
                <p>{biz.description}</p>
              </div>
              <div className="biz-card-footer">
                <div className="biz-launch-btn">
                  Launch Dashboard <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
