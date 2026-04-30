const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../sqlite.db');

// Remove existing DB to start fresh
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑  Removed old database');
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create all tables
db.exec(`
  CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT DEFAULT '🏢',
    color TEXT DEFAULT '#16a34a',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS company_profiles (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    established TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS stakeholders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    history TEXT,
    company_profile_id TEXT NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    last_updated TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS land_operations (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    size REAL NOT NULL,
    unit TEXT NOT NULL,
    crop_status TEXT,
    forecast TEXT,
    last_updated TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    date TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reference_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );
`);

// Seed businesses
const now = new Date().toISOString();
const insertBiz = db.prepare(`
  INSERT OR IGNORE INTO businesses (id, name, slug, description, icon, color, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const bizList = [
  { id: randomUUID(), name: 'Vettiver', slug: 'vettiver', description: 'Premium Vetiver grass cultivation — soil conservation and aromatic oil production.', icon: '🌿', color: '#16a34a' },
  { id: randomUUID(), name: 'Chicken Farm', slug: 'chicken-farm', description: 'Poultry farming — broiler and layer chickens with modern farm management.', icon: '🐔', color: '#f59e0b' },
  { id: randomUUID(), name: 'Wood Works', slug: 'woodworks', description: 'Timber processing and wood product manufacturing for residential and commercial use.', icon: '🪵', color: '#92400e' },
];

for (const b of bizList) {
  insertBiz.run(b.id, b.name, b.slug, b.description, b.icon, b.color, now, now);
  console.log(`✓ Seeded: ${b.icon} ${b.name}`);
}

db.close();
console.log('\n✅ Database created and seeded successfully!');
