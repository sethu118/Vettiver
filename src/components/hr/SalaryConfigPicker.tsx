'use client';

export default function SalaryConfigPicker({ defaultValue }: { defaultValue: string }) {
  return (
    <select 
      name="salaryConfig" 
      defaultValue={defaultValue} 
      className="form-input" 
      style={{ width: '120px', padding: '0.2rem' }} 
      onChange={(e) => e.target.form?.submit()}
    >
      <option value="Monthly">Monthly</option>
      <option value="Weekly">Weekly</option>
    </select>
  );
}
