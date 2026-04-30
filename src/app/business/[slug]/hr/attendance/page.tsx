import { getBusinessBySlug, getEmployees, getAttendance } from '@/actions';
import { notFound } from 'next/navigation';
import AttendanceGrid from '@/components/hr/AttendanceGrid';
import MonthPicker from '@/components/hr/MonthPicker';
import Link from 'next/link';

export default async function AttendancePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ month?: string }>
}) {
  const { slug } = await params;
  const { month: selectedMonth } = await searchParams;
  const biz = await getBusinessBySlug(slug);
  if (!biz) notFound();

  // Default to current month if not provided
  const now = new Date();
  const currentMonthStr = selectedMonth || `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

  const employees = await getEmployees(biz.id);
  const attendanceRecords = await getAttendance(biz.id, currentMonthStr);

  return (
    <div className="animate-fadeIn">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">📅 Attendance Master</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Track daily presence and overtime for {biz.name}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <form method="get" action={`/business/${slug}/hr/attendance`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select Month:</label>
            <MonthPicker defaultValue={currentMonthStr} slug={slug} basePath={`/business/${slug}/hr/attendance`} />
          </form>
          <Link href={`/business/${slug}/hr/employees`} className="btn btn-secondary">Employee Master →</Link>
        </div>
      </header>

      <AttendanceGrid 
        bizId={biz.id} 
        salaryConfig={biz.salaryConfig as 'Monthly' | 'Weekly'}
        employees={employees.map(e => ({ 
          id: e.id, 
          name: e.name, 
          wages: e.wages, 
          wagesPerHour: e.wagesPerHour 
        }))} 
        initialRecords={attendanceRecords.map(r => ({ 
          employeeId: r.employeeId, 
          date: r.date, 
          status: r.status, 
          otHours: r.otHours 
        }))}
        currentMonth={currentMonthStr}
      />
    </div>
  );
}
