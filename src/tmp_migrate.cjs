const Database = require('better-sqlite3');
const db = new Database('sqlite.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    uom TEXT NOT NULL,
    base_price REAL DEFAULT 0 NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    party_id TEXT NOT NULL,
    location TEXT,
    total_amount REAL DEFAULT 0 NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'Pending' NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    product_id TEXT,
    description TEXT NOT NULL,
    quantity REAL NOT NULL,
    uom TEXT NOT NULL,
    rate REAL NOT NULL,
    total REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );
`);
db.close();
console.log('Database updated successfully');
