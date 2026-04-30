const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'sqlite.db');
const db = new Database(dbPath);

console.log('Running HR & Payroll migration...');

try {
  // Add salary_config to businesses
  db.prepare(`ALTER TABLE businesses ADD COLUMN salary_config TEXT DEFAULT 'Monthly' NOT NULL`).run();
  console.log('Added salary_config to businesses');
} catch (e) {
  console.log('salary_config might already exist:', e.message);
}

// Create employees table
db.prepare(`
  CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    name TEXT NOT NULL,
    sex TEXT,
    age INTEGER,
    location TEXT,
    phone TEXT,
    emergency_contact TEXT,
    address TEXT,
    blood_group TEXT,
    remarks TEXT,
    status TEXT DEFAULT 'Active' NOT NULL,
    wages REAL DEFAULT 0 NOT NULL,
    wages_per_hour REAL DEFAULT 0 NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
  )
`).run();
console.log('Created employees table');

// Create attendance_records table
db.prepare(`
  CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    business_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'Present' NOT NULL,
    ot_hours REAL DEFAULT 0 NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
  )
`).run();
console.log('Created attendance_records table');

console.log('Migration complete.');
db.close();
