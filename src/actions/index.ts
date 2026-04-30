'use server';

import { db } from '@/db';
import {
  businesses,
  companyProfiles,
  stakeholders,
  contacts,
  inventory,
  landOperations,
  transactions,
  products,
  invoices,
  invoiceItems,
  employees,
  attendanceRecords,
} from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// ── Businesses ────────────────────────────────────────────────
export async function getBusinesses() {
  return await db.select().from(businesses);
}

export async function getBusinessBySlug(slug: string) {
  return await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1).then(r => r[0]);
}

// ── Company Profile ───────────────────────────────────────────
export async function getCompanyProfile(businessId: string) {
  return await db.select().from(companyProfiles)
    .where(eq(companyProfiles.businessId, businessId)).limit(1).then(r => r[0]);
}

export async function upsertCompanyProfile(businessId: string, formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    address: (formData.get('address') as string) || null,
    established: (formData.get('established') as string) || null,
  };
  const existing = await getCompanyProfile(businessId);
  if (existing) {
    await db.update(companyProfiles).set(data).where(eq(companyProfiles.id, existing.id));
  } else {
    await db.insert(companyProfiles).values({ ...data, businessId });
  }
  revalidatePath(`/business/${businessId}`);
}

// ── Stakeholders ──────────────────────────────────────────────
export async function getStakeholders(businessId: string) {
  const profile = await getCompanyProfile(businessId);
  if (!profile) return [];
  return await db.select().from(stakeholders)
    .where(eq(stakeholders.companyProfileId, profile.id));
}

export async function addStakeholder(businessId: string, formData: FormData) {
  const profile = await getCompanyProfile(businessId);
  if (!profile) throw new Error('Company profile must be created first.');
  await db.insert(stakeholders).values({
    name: formData.get('name') as string,
    role: formData.get('role') as string,
    history: (formData.get('history') as string) || null,
    companyProfileId: profile.id,
  });
  revalidatePath(`/business/${businessId}/profile`);
}

// ── Contacts ──────────────────────────────────────────────────
export async function getContacts(businessId: string) {
  return await db.select().from(contacts).where(eq(contacts.businessId, businessId));
}

export async function getAllContacts() {
  return await db.select().from(contacts);
}

export async function addContact(businessId: string, formData: FormData) {
  await db.insert(contacts).values({
    businessId,
    name: formData.get('name') as string,
    type: formData.get('type') as string,
    phone: (formData.get('phone') as string) || null,
    email: (formData.get('email') as string) || null,
    notes: (formData.get('notes') as string) || null,
  });
  revalidatePath(`/business/${businessId}/contacts`);
}

// ── Inventory ─────────────────────────────────────────────────
export async function getInventory(businessId: string) {
  return await db.select().from(inventory).where(eq(inventory.businessId, businessId));
}

export async function addInventory(businessId: string, formData: FormData) {
  await db.insert(inventory).values({
    businessId,
    productName: formData.get('productName') as string,
    quantity: parseInt(formData.get('quantity') as string, 10),
    unit: formData.get('unit') as string,
    notes: (formData.get('notes') as string) || null,
  });
  revalidatePath(`/business/${businessId}/inventory`);
}

// ── Land Operations ───────────────────────────────────────────
export async function getLandOperations(businessId: string) {
  return await db.select().from(landOperations).where(eq(landOperations.businessId, businessId));
}

export async function addLandOperation(businessId: string, formData: FormData) {
  await db.insert(landOperations).values({
    businessId,
    location: formData.get('location') as string,
    size: parseFloat(formData.get('size') as string),
    unit: formData.get('unit') as string,
    cropStatus: (formData.get('cropStatus') as string) || null,
    forecast: (formData.get('forecast') as string) || null,
  });
  revalidatePath(`/business/${businessId}/inventory`);
}

// ── Transactions ──────────────────────────────────────────────
export async function getTransactions(businessId: string) {
  return await db.select().from(transactions)
    .where(eq(transactions.businessId, businessId))
    .orderBy(desc(transactions.date));
}

export async function addTransaction(businessId: string, formData: FormData) {
  await db.insert(transactions).values({
    businessId,
    type: formData.get('type') as string,
    amount: parseFloat(formData.get('amount') as string),
    description: formData.get('description') as string,
    date: (formData.get('date') as string) || new Date().toISOString().split('T')[0],
    referenceId: (formData.get('referenceId') as string) || null,
  });
  revalidatePath(`/business/${businessId}/accounting`);
}

export async function updateTransaction(transactionId: string, businessId: string, formData: FormData) {
  await db.update(transactions).set({
    type: formData.get('type') as string,
    amount: parseFloat(formData.get('amount') as string),
    description: formData.get('description') as string,
    date: (formData.get('date') as string) || new Date().toISOString().split('T')[0],
    referenceId: (formData.get('referenceId') as string) || null,
    updatedAt: new Date().toISOString()
  }).where(eq(transactions.id, transactionId));
  revalidatePath(`/business/${businessId}/accounting`);
}

export async function deleteTransaction(transactionId: string, businessId: string) {
  await db.delete(transactions).where(eq(transactions.id, transactionId));
  revalidatePath(`/business/${businessId}/accounting`);
}

// ── Products ──────────────────────────────────────────────────
export async function getProducts(businessId: string) {
  return await db.select().from(products).where(eq(products.businessId, businessId));
}

export async function addProduct(businessId: string, formData: FormData) {
  await db.insert(products).values({
    businessId,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    uom: formData.get('uom') as string,
    basePrice: parseFloat(formData.get('basePrice') as string) || 0,
  });
  revalidatePath(`/business/${businessId}/inventory/products`);
}

// ── Invoices ──────────────────────────────────────────────────
export async function getInvoices(businessId: string, type?: 'Receivable' | 'Payable') {
  if (type) {
    return await db.select().from(invoices)
      .where(and(eq(invoices.businessId, businessId), eq(invoices.type, type)))
      .orderBy(desc(invoices.date));
  }
  return await db.select().from(invoices)
    .where(eq(invoices.businessId, businessId))
    .orderBy(desc(invoices.date));
}

export async function getInvoiceById(id: string) {
  const invoice = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1).then(r => r[0]);
  if (!invoice) return null;
  const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
  const party = await db.select().from(contacts).where(eq(contacts.id, invoice.partyId)).limit(1).then(r => r[0]);
  return { ...invoice, items, party };
}

async function generateInvoiceNumber(businessId: string, type: 'Receivable' | 'Payable') {
  const prefix = type === 'Receivable' ? 'INV' : 'PUR';
  const year = new Date().getFullYear();
  const count = await db.select().from(invoices).where(and(eq(invoices.businessId, businessId), eq(invoices.type, type))).then(r => r.length + 1);
  return `${prefix}-${year}-${count.toString().padStart(4, '0')}`;
}

export async function createInvoice(businessId: string, type: 'Receivable' | 'Payable', data: any, items: any[]) {
  const invNumber = await generateInvoiceNumber(businessId, type);
  const totalAmount = isNaN(parseFloat(data.totalAmount)) ? 0 : parseFloat(data.totalAmount);
  
  const [newInv] = await db.insert(invoices).values({
    businessId,
    invoiceNumber: invNumber,
    type,
    date: data.date,
    partyId: data.partyId,
    location: data.location,
    totalAmount: totalAmount,
    notes: data.notes,
    status: 'Confirmed',
  }).returning();

  for (const item of items) {
    const q = isNaN(parseFloat(item.quantity)) ? 0 : parseFloat(item.quantity);
    const r = isNaN(parseFloat(item.rate)) ? 0 : parseFloat(item.rate);
    const t = isNaN(parseFloat(item.total)) ? 0 : parseFloat(item.total);

    await db.insert(invoiceItems).values({
      invoiceId: newInv.id,
      productId: item.productId || null,
      description: item.description,
      quantity: q,
      uom: item.uom,
      rate: r,
      total: t,
    });
  }

  // Also add to transactions for accounting overview
  await db.insert(transactions).values({
    businessId,
    type: type === 'Receivable' ? 'Income' : 'Expense',
    amount: totalAmount,
    description: `${type} Invoice: ${invNumber}`,
    date: data.date,
    referenceId: invNumber,
  });

  revalidatePath(`/business/${businessId}/accounting/${type.toLowerCase()}`);
  return newInv.id;
}

// ── HR & Payroll ─────────────────────────────────────────────
export async function getEmployees(businessId: string) {
  return await db.select().from(employees).where(eq(employees.businessId, businessId));
}

export async function addEmployee(businessId: string, formData: FormData) {
  await db.insert(employees).values({
    businessId,
    name: formData.get('name') as string,
    sex: (formData.get('sex') as string) || null,
    age: parseInt(formData.get('age') as string) || null,
    location: (formData.get('location') as string) || null,
    phone: (formData.get('phone') as string) || null,
    emergencyContact: (formData.get('emergencyContact') as string) || null,
    address: (formData.get('address') as string) || null,
    bloodGroup: (formData.get('bloodGroup') as string) || null,
    remarks: (formData.get('remarks') as string) || null,
    wages: parseFloat(formData.get('wages') as string) || 0,
    wagesPerHour: parseFloat(formData.get('wagesPerHour') as string) || 0,
    status: 'Active',
  });
  revalidatePath(`/business/${businessId}/hr/employees`);
}

export async function getAttendance(businessId: string, month: string) {
  // month: 'YYYY-MM'
  return await db.select().from(attendanceRecords)
    .where(and(eq(attendanceRecords.businessId, businessId), sql`strftime('%Y-%m', ${attendanceRecords.date}) = ${month}`));
}

export async function updateAttendanceBulk(businessId: string, records: any[]) {
  for (const record of records) {
    const existing = await db.select().from(attendanceRecords)
      .where(and(
        eq(attendanceRecords.employeeId, record.employeeId),
        eq(attendanceRecords.date, record.date)
      )).limit(1).then(r => r[0]);

    if (existing) {
      await db.update(attendanceRecords).set({
        status: record.status,
        otHours: record.otHours,
        updatedAt: new Date().toISOString()
      }).where(eq(attendanceRecords.id, existing.id));
    } else {
      await db.insert(attendanceRecords).values({
        businessId,
        employeeId: record.employeeId,
        date: record.date,
        status: record.status,
        otHours: record.otHours
      });
    }
  }
  revalidatePath(`/business/${businessId}/hr/attendance`);
}

export async function updateBusinessSalaryConfig(businessId: string, config: 'Monthly' | 'Weekly') {
  await db.update(businesses).set({ salaryConfig: config }).where(eq(businesses.id, businessId));
  revalidatePath(`/business/${businessId}/hr`);
}
