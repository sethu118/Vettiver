'use client';

import { useState } from 'react';

interface Employee {
  id: string;
  name: string;
  wages: number;
  wagesPerHour: number;
}

interface AttendanceSummary {
  presentDays: number;
  totalOTHours: number;
}

export default function PayrollEntry({ 
  employee, 
  summary, 
  periodType 
}: { 
  employee: Employee, 
  summary: AttendanceSummary,
  periodType: 'Monthly' | 'Weekly'
}) {
  const [deductions, setDeductions] = useState(0);
  const [remarks, setRemarks] = useState('');

  const otPay = summary.totalOTHours * employee.wagesPerHour;
  const basePay = periodType === 'Monthly' ? employee.wages : employee.wages; // Defaulting to base wages for the period
  
  // If base pay is monthly, and we are in weekly view, we should divide? 
  // User asked for "Configuration required in company wise". 
  // For now I'll assume the 'wages' field in Employee Master is the base for the configured period.
  
  const netSalary = basePay + otPay - deductions;

  return (
    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
      <td style={{ padding: '1.25rem 1rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{employee.name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Base Rate: ₹{employee.wages}/{periodType}</div>
      </td>
      <td style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600 }}>{summary.presentDays} / {periodType === 'Weekly' ? '7' : 'Month'} Days</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{summary.totalOTHours} OT Hrs</div>
      </td>
      <td style={{ textAlign: 'right', fontWeight: 600 }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{periodType} Base Salary</div>
        ₹{basePay.toLocaleString()}
      </td>
      <td style={{ textAlign: 'right', color: 'var(--primary)', fontWeight: 600 }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{periodType} OT Amount</div>
        +₹{otPay.toLocaleString()}
      </td>
      <td style={{ textAlign: 'right' }}>
        <input 
          type="number" 
          value={deductions} 
          onChange={(e) => setDeductions(parseFloat(e.target.value) || 0)}
          className="form-input"
          style={{ width: '100px', padding: '0.3rem', textAlign: 'right', color: 'var(--danger)', fontWeight: 700 }}
          placeholder="Deductions"
        />
      </td>
      <td style={{ textAlign: 'right', fontSize: '1.25rem', fontWeight: 900, color: 'var(--foreground)' }}>
        ₹{netSalary.toLocaleString()}
      </td>
      <td style={{ textAlign: 'right' }}>
        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
          Generate Slip
        </button>
      </td>
    </tr>
  );
}
