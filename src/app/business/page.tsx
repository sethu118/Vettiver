import { getBusinesses } from '@/actions';
import Link from 'next/link';

export default async function BusinessIndexPage() {
  const bizList = await getBusinesses();

  return (
    <div className="global-page-body">
      <h1 className="page-title">Our Businesses</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Select a business to view its dashboard, inventory, accounting, and more.</p>
      <div className="biz-grid">
        {bizList.map(biz => (
          <Link href={`/business/${biz.slug}`} key={biz.id} className="biz-card" style={{ '--biz-color': biz.color } as any}>
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
  );
}
