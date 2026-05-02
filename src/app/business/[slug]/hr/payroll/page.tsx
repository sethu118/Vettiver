import { getBusinessBySlug, getEmployees, getAttendance, updateBusinessSalaryConfig } from '@/actions';
import { notFound } from 'next/navigation';
import PayrollEntry from '@/components/hr/PayrollEntry';
import MonthPicker from '@/components/hr/MonthPicker';
import SalaryConfigPicker from '@/components/hr/SalaryConfigPicker';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function PayrollPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ month?: string, week?: string }>
}) {
  const { slug } = await params;
  const { month: selectedMonth, week: selectedWeek } = await searchParams;
  const biz = await getBusinessBySlug(slug);
  if (!biz) notFound();

  // Default to current month
  const now = new Date();
  const currentMonthStr = selectedMonth || `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

  const employees = await getEmployees(biz.id);
  const attendanceRecords = await getAttendance(biz.id, currentMonthStr);

  // Determine current week dates if weekly cycle
  const getWeekDates = (weekRef: string) => {
    const d = new Date(weekRef);
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay()); // Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day.toISOString().split('T')[0];
    });
  };

  const isWeekly = biz.salaryConfig === 'Weekly';
  const currentWeekRef = selectedWeek || now.toISOString().split('T')[0];
  const weekDates = getWeekDates(currentWeekRef);

  // Group attendance by employee for summary
  const attendanceSummary: Record<string, { presentDays: number, totalOTHours: number }> = {};
  employees.forEach(emp => {
    let empRecords = attendanceRecords.filter(r => r.employeeId === emp.id);
    
    // Filter by week if in weekly mode
    if (isWeekly) {
      empRecords = empRecords.filter(r => weekDates.includes(r.date));
    }

    attendanceSummary[emp.id] = {
      presentDays: empRecords.filter(r => r.status === 'Present' || r.status === 'Half Day').length,
      totalOTHours: empRecords.reduce((acc, curr) => acc + curr.otHours, 0)
    };
  });

  const handleConfigChange = async (formData: FormData) => {
    'use server';
    const config = formData.get('salaryConfig') as 'Weekly' | 'Monthly';
    await updateBusinessSalaryConfig(biz.id, config);
    revalidatePath(`/business/${slug}/hr/payroll`);
  };

  return (
    <div className="animate-fadeIn">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">💰 Payroll Hub</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Generate salary slips and manage wage configurations for {biz.name}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <form action={handleConfigChange} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Payroll Cycle:</label>
            <SalaryConfigPicker defaultValue={biz.salaryConfig} />
          </form>
          <Link href={`/business/${slug}/hr/employees`} className="btn btn-secondary">Employee Master →</Link>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {isWeekly ? `Weekly Salary: ${weekDates[0]} to ${weekDates[6]}` : `Monthly Salary: ${currentMonthStr}`}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {isWeekly && (
              <form method="get" action={`/business/${slug}/hr/payroll`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Week of:</label>
                <input 
                  type="date" 
                  name="week" 
                  defaultValue={currentWeekRef} 
                  className="form-input" 
                  style={{ padding: '0.4rem' }}
                  onChange={(e) => (e.target.form as HTMLFormElement).submit()}
                />
              </form>
            )}
            <form method="get" action={`/business/${slug}/hr/payroll`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MonthPicker defaultValue={currentMonthStr} slug={slug} basePath={`/business/${slug}/hr/payroll`} />
            </form>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: 'var(--surface)' }}>
                <th>Employee / Base Wage</th>
                <th style={{ textAlign: 'center' }}>Attendance Summary</th>
                <th style={{ textAlign: 'right' }}>{isWeekly ? 'Total Weekly Salary' : 'Standard Pay (Monthly)'}</th>
                <th style={{ textAlign: 'right' }}>{isWeekly ? 'Weekly OT Amount' : 'Overtime (OT)'}</th>
                <th style={{ textAlign: 'right' }}>Deductions (Advance)</th>
                <th style={{ textAlign: 'right' }}>Net Salary</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No employees registered yet.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <PayrollEntry 
                    key={emp.id} 
                    employee={{ id: emp.id, name: emp.name, wages: emp.wages, wagesPerHour: emp.wagesPerHour }} 
                    summary={attendanceSummary[emp.id] || { presentDays: 0, totalOTHours: 0 }}
                    periodType={biz.salaryConfig as 'Monthly' | 'Weekly'}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
