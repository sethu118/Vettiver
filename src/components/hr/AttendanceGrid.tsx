'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { updateAttendanceBulk } from '@/actions';

interface Employee {
  id: string;
  name: string;
  wages: number;
  wagesPerHour: number;
}

interface AttendanceRecord {
  employeeId: string;
  date: string;
  status: string;
  otHours: number;
}

export default function AttendanceGrid({ 
  bizId, 
  salaryConfig,
  employees, 
  initialRecords, 
  currentMonth 
}: { 
  bizId: string, 
  salaryConfig: 'Monthly' | 'Weekly',
  employees: Employee[], 
  initialRecords: AttendanceRecord[],
  currentMonth: string // 'YYYY-MM'
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const view = (searchParams.get('view') as 'month' | 'week') || 'month';
  const weekParam = searchParams.get('week'); // YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (weekParam) return new Date(weekParam);
    return new Date();
  });

  const [showPayroll, setShowPayroll] = useState(false);

  const setView = (v: 'month' | 'week') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', v);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    // Sync URL if missing params but in week view
    if (view === 'week' && !weekParam) {
      const params = new URLSearchParams(searchParams.toString());
      const Y = selectedDate.getFullYear();
      const M = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const D = selectedDate.getDate().toString().padStart(2, '0');
      params.set('week', `${Y}-${M}-${D}`);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [view, weekParam, selectedDate, searchParams, pathname, router]);

  const [records, setRecords] = useState<Record<string, Record<string, { status: string, otHours: number }>>>(() => {
    const map: any = {};
    initialRecords.forEach(r => {
      if (!map[r.employeeId]) map[r.employeeId] = {};
      map[r.employeeId][r.date] = { status: r.status, otHours: r.otHours };
    });
    return map;
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Generate days for the month
  const [year, month] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const allMonthDates = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return `${currentMonth}-${day.toString().padStart(2, '0')}`;
  });

  // Filter dates if weekly view
  const dates = view === 'month' ? allMonthDates : (() => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const Y = d.getFullYear();
      const M = (d.getMonth() + 1).toString().padStart(2, '0');
      const D = d.getDate().toString().padStart(2, '0');
      return `${Y}-${M}-${D}`;
    });
  })();

  const navigateWeek = (dir: number) => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + (dir * 7));
    setSelectedDate(next);
    
    // Also update URL to keep it in sync
    const params = new URLSearchParams(searchParams.toString());
    const Y = next.getFullYear();
    const M = (next.getMonth() + 1).toString().padStart(2, '0');
    const D = next.getDate().toString().padStart(2, '0');
    params.set('week', `${Y}-${M}-${D}`);
    router.push(`${pathname}?${params.toString()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'var(--primary)';
      case 'Absent': return 'var(--danger)';
      case 'Half Day': return '#f59e0b';
      case 'Holiday': return '#6366f1';
      default: return 'var(--text-muted)';
    }
  };

  const updateRecord = (empId: string, date: string, field: 'status' | 'otHours', value: any) => {
    setRecords(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        [date]: {
          ...(prev[empId]?.[date] || { status: 'Present', otHours: 0 }),
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const markHolidayForDay = (date: string) => {
    const updated = { ...records };
    employees.forEach(emp => {
      if (!updated[emp.id]) updated[emp.id] = {};
      updated[emp.id][date] = { ...(updated[emp.id][date] || { otHours: 0 }), status: 'Holiday' };
    });
    setRecords(updated);
    setHasChanges(true);
  };

  const calculatePayrollForEmployee = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return { base: 0, ot: 0, total: 0, days: 0, otHours: 0 };

    let presentDays = 0;
    let otHours = 0;

    dates.forEach(date => {
      const rec = records[empId]?.[date] || { status: 'Present', otHours: 0 };
      if (rec.status === 'Present' || rec.status === 'Holiday') presentDays += 1;
      else if (rec.status === 'Half Day') presentDays += 0.5;
      otHours += rec.otHours;
    });

    // Pro-rate base salary based on days in view vs present days
    // If Monthly, and viewing whole month, total days is daysInMonth
    // If Weekly, total days is 7
    const periodDays = view === 'month' ? daysInMonth : 7;
    const basePay = (presentDays / periodDays) * emp.wages;
    const otPay = otHours * emp.wagesPerHour;
    
    return {
      base: basePay,
      ot: otPay,
      total: basePay + otPay,
      days: presentDays,
      otHours: otHours
    };
  };

  const handleSave = async () => {
    setSaving(true);
    const flattened: any[] = [];
    Object.entries(records).forEach(([empId, dayMap]) => {
      Object.entries(dayMap).forEach(([date, data]) => {
        flattened.push({ employeeId: empId, date, ...data });
      });
    });

    try {
      await updateAttendanceBulk(bizId, flattened);
      setHasChanges(false);
      alert('Attendance saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const exportSalaryDetails = () => {
    const doc = new (require('jspdf').jsPDF)({ orientation: 'landscape' });
    const autoTable = require('jspdf-autotable').default;

    // Build headers: [Employee, ...dates, Total]
    const dateHeaders = dates.map(d => d.split('-').pop());
    const headers = [['Employee', ...dateHeaders, 'Days', 'OT', 'Total']];

    const rows = employees.map(emp => {
      const payroll = calculatePayrollForEmployee(emp.id);
      const rowData = [emp.name];
      
      dates.forEach(date => {
        const rec = records[emp.id]?.[date] || { status: 'Present', otHours: 0 };
        const statusChar = rec.status === 'Present' ? 'P' : rec.status === 'Absent' ? 'A' : rec.status === 'Half Day' ? '1/2' : 'H';
        rowData.push(statusChar);
      });

      rowData.push(payroll.days.toFixed(1));
      rowData.push(payroll.otHours.toFixed(1));
      rowData.push(`₹${payroll.total.toFixed(0)}`);
      
      return rowData;
    });

    // Add title
    doc.setFontSize(14);
    doc.text(`Detailed Salary & Attendance - ${currentMonth} (${view.toUpperCase()})`, 14, 12);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`P: Present | A: Absent | 1/2: Half Day | H: Holiday | Generated: ${new Date().toLocaleString()}`, 14, 18);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 22,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74], textColor: 255, fontSize: 7, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 7, cellPadding: 1, halign: 'center' },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 35 },
        // Dates will be auto-sized
        [dates.length + 1]: { halign: 'right', fontStyle: 'bold' },
        [dates.length + 2]: { halign: 'right', fontStyle: 'bold' },
        [dates.length + 3]: { halign: 'right', fontStyle: 'bold', fillColor: [220, 252, 231] }
      }
    });

    doc.save(`Detailed_Salary_${currentMonth}_${view}.pdf`);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>📅 Attendance Master</h2>
          <div style={{ display: 'flex', background: 'var(--surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
            <button id="view-month" onClick={() => setView('month')} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: view === 'month' ? '#fff' : 'transparent', boxShadow: view === 'month' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Month View</button>
            <button id="view-week" onClick={() => setView('week')} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: view === 'week' ? '#fff' : 'transparent', boxShadow: view === 'week' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Weekly</button>
          </div>
          <div 
            onClick={() => setShowPayroll(!showPayroll)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: showPayroll ? 'var(--primary-light)' : 'var(--surface)', 
              padding: '0.4rem 1rem', 
              borderRadius: 'var(--radius-md)', 
              border: `1px solid ${showPayroll ? 'var(--primary)' : 'var(--surface-border)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>💰</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: showPayroll ? 'var(--primary)' : 'var(--text-main)' }}>Payroll Mode</span>
          </div>
          {view === 'week' && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '1rem' }}>
              <button onClick={() => navigateWeek(-1)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>← Prev Week</button>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{dates[0]} to {dates[6]}</span>
              <button onClick={() => navigateWeek(1)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>Next Week →</button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {hasChanges && <span style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>⚠️ Unsaved Changes</span>}
          <button className="btn" onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? 'Saving...' : 'Save Attendance Changes'}
          </button>
          <button className="btn btn-secondary" onClick={exportSalaryDetails} style={{ border: '2px solid var(--primary)', color: 'var(--primary)', fontWeight: 800 }}>
            📥 Generate Salary Details
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', maxHeight: '70vh', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%' }}>
          <thead>
            <tr style={{ background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10 }}>
              <th style={{ position: 'sticky', left: 0, background: 'inherit', zIndex: 20, padding: '1rem', textAlign: 'left', borderRight: '1px solid var(--surface-border)', minWidth: '180px', width: '180px' }}>
                Employee
              </th>
              <th style={{ position: 'sticky', left: '180px', background: 'var(--surface)', zIndex: 20, padding: '1rem', textAlign: 'right', borderRight: '2px solid var(--surface-border)', minWidth: '120px', width: '120px' }}>
                Total Pay
              </th>
              {dates.map(date => {
                const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                const dnum = date.split('-').pop();
                return (
                  <th key={date} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid var(--surface-border)', minWidth: '80px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{day}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{dnum}</div>
                    {!showPayroll && (
                      <button 
                        onClick={() => markHolidayForDay(date)}
                        title="Mark as Holiday"
                        style={{ background: 'none', border: 'none', padding: 0.2, cursor: 'pointer', fontSize: '0.65rem', color: '#6366f1' }}
                      >
                        ⛱️ Set Hol
                      </button>
                    )}
                  </th>
                );
              })}
              <th style={{ position: 'sticky', right: 0, background: 'var(--surface)', zIndex: 20, padding: '1rem', textAlign: 'right', borderLeft: '2px solid var(--surface-border)', minWidth: '150px' }}>
                Payout Detail
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const payroll = calculatePayrollForEmployee(emp.id);
              return (
                <tr key={emp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 5, padding: '1rem', fontWeight: 700, borderRight: '1px solid var(--surface-border)', width: '180px' }}>
                    <div style={{ wordBreak: 'break-all' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      Rate: ₹{emp.wages}/{salaryConfig === 'Weekly' ? 'Wk' : 'Mo'}
                    </div>
                  </td>
                  <td style={{ position: 'sticky', left: '180px', background: '#fdfdfd', zIndex: 5, padding: '1rem', textAlign: 'right', borderRight: '2px solid var(--surface-border)', fontWeight: 900, color: 'var(--foreground)', fontSize: '1rem', width: '120px' }}>
                    ₹{payroll.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                  {dates.map(date => {
                    const record = records[emp.id]?.[date] || { status: 'Present', otHours: 0 };
                    return (
                      <td key={date} style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                          <select 
                            value={record.status}
                            onChange={(e) => updateRecord(emp.id, date, 'status', e.target.value)}
                            style={{ 
                              padding: '0.2rem', 
                              fontSize: '0.75rem', 
                              borderRadius: '0.25rem', 
                              border: `1px solid ${getStatusColor(record.status)}`,
                              color: getStatusColor(record.status),
                              fontWeight: 700,
                              width: '70px',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Half Day">Half Day</option>
                            <option value="Holiday">Holiday</option>
                          </select>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>OT:</span>
                            <input 
                              type="number"
                              value={record.otHours}
                              onChange={(e) => updateRecord(emp.id, date, 'otHours', parseFloat(e.target.value) || 0)}
                              style={{ 
                                width: '35px', 
                                fontSize: '0.75rem', 
                                padding: '0.1rem', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.2rem',
                                textAlign: 'center'
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ position: 'sticky', right: 0, background: '#f8fafc', zIndex: 5, padding: '1rem', textAlign: 'right', borderLeft: '2px solid var(--surface-border)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>₹{payroll.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                      ₹{payroll.base.toFixed(0)} + ₹{payroll.ot.toFixed(0)} (OT)
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 600 }}>
                      {payroll.days} Days | {payroll.otHours} OT
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }}></span> Present
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--danger)' }}></span> Absent
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#6366f1' }}></span> Holiday
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          * Scroll horizontally to see all days. Employees are frozen on the left.
        </div>
      </div>
    </div>
  );
}
