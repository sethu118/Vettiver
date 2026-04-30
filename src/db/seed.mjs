import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

const db = new Database('sqlite.db');

const now = new Date().toISOString();

const businesses = [
  { id: randomUUID(), name: 'Vettiver', slug: 'vettiver', description: 'Premium Vetiver grass cultivation — soil conservation and aromatic oil production.', icon: '🌿', color: '#16a34a' },
  { id: randomUUID(), name: 'Chicken Farm', slug: 'chicken-farm', description: 'Poultry farming — broiler and layer chickens with modern farm management.', icon: '🐔', color: '#f59e0b' },
  { id: randomUUID(), name: 'Wood Works', slug: 'woodworks', description: 'Timber processing and wood product manufacturing for residential and commercial use.', icon: '🪵', color: '#92400e' },
];

const stmt = db.prepare(`
  INSERT OR IGNORE INTO businesses (id, name, slug, description, icon, color, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const b of businesses) {
  stmt.run(b.id, b.name, b.slug, b.description, b.icon, b.color, now, now);
  console.log(`✓ Seeded: ${b.icon} ${b.name}`);
}

db.close();
console.log('\n✅ Businesses seeded successfully!');
