import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

const timestamps = {
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
};

// ── Businesses (top-level entities) ──────────────────────────
export const businesses = sqliteTable('businesses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon').default('🏢'),
  color: text('color').default('#16a34a'),
  salaryConfig: text('salary_config').default('Monthly').notNull(), // 'Monthly' or 'Weekly'
  ...timestamps,
});

// ── Company Profile & Stakeholders ───────────────────────────
export const companyProfiles = sqliteTable('company_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  address: text('address'),
  established: text('established'),
  ...timestamps,
});

export const stakeholders = sqliteTable('stakeholders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  role: text('role').notNull(),
  history: text('history'),
  companyProfileId: text('company_profile_id')
    .notNull()
    .references(() => companyProfiles.id, { onDelete: 'cascade' }),
  ...timestamps,
});

// ── Contacts ─────────────────────────────────────────────────
export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  phone: text('phone'),
  email: text('email'),
  notes: text('notes'),
  ...timestamps,
});

// ── Inventory ────────────────────────────────────────────────
export const inventory = sqliteTable('inventory', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  unit: text('unit').notNull(),
  lastUpdated: text('last_updated').default(sql`CURRENT_TIMESTAMP`).notNull(),
  notes: text('notes'),
  ...timestamps,
});

// ── Land / Operations ────────────────────────────────────────
export const landOperations = sqliteTable('land_operations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  location: text('location').notNull(),
  size: real('size').notNull(),
  unit: text('unit').notNull(),
  cropStatus: text('crop_status'),
  forecast: text('forecast'),
  lastUpdated: text('last_updated').default(sql`CURRENT_TIMESTAMP`).notNull(),
  ...timestamps,
});

// ── Transactions ─────────────────────────────────────────────
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  date: text('date').default(sql`CURRENT_TIMESTAMP`).notNull(),
  referenceId: text('reference_id'),
  ...timestamps,
});
// ── Products (Product Master) ─────────────────────────────
export const products = sqliteTable('products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  uom: text('uom').notNull(), // Unit of Measure (kg, bags, etc.)
  basePrice: real('base_price').default(0).notNull(),
  ...timestamps,
});

// ── Invoices (Receivables & Payables) ───────────────────────
export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  invoiceNumber: text('invoice_number').notNull(),
  type: text('type').notNull(), // 'Receivable' (Sale) or 'Payable' (Purchase)
  date: text('date').notNull(),
  partyId: text('party_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  location: text('location'), // Master driven location
  totalAmount: real('total_amount').default(0).notNull(),
  notes: text('notes'),
  status: text('status').default('Pending').notNull(),
  ...timestamps,
});

export const invoiceItems = sqliteTable('invoice_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
  description: text('description').notNull(),
  quantity: real('quantity').notNull(),
  uom: text('uom').notNull(),
  rate: real('rate').notNull(),
  total: real('total').notNull(),
  ...timestamps,
});

// ── HR & Payroll ─────────────────────────────────────────────
export const employees = sqliteTable('employees', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sex: text('sex'), // 'Male', 'Female', 'Other'
  age: integer('age'),
  location: text('location'),
  phone: text('phone'),
  emergencyContact: text('emergency_contact'),
  address: text('address'),
  bloodGroup: text('blood_group'),
  remarks: text('remarks'),
  status: text('status').default('Active').notNull(), // 'Active', 'Inactive'
  wages: real('wages').default(0).notNull(), // Monthly/Weekly base
  wagesPerHour: real('wages_per_hour').default(0).notNull(),
  ...timestamps,
});

export const attendanceRecords = sqliteTable('attendance_records', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  employeeId: text('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // 'YYYY-MM-DD'
  status: text('status').default('Present').notNull(), // 'Present', 'Absent', 'Half Day', 'Holiday'
  otHours: real('ot_hours').default(0).notNull(),
  notes: text('notes'),
  ...timestamps,
});
