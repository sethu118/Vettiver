'use client';

import { useState } from 'react';
import { addEmployee } from '@/actions';

export default function EmployeeForm({ bizId, slug }: { bizId: string, slug: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addEmployee(bizId, formData);
      (e.target as HTMLFormElement).reset();
      alert('Employee added successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to add employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>🆕 Register New Employee</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input type="text" name="name" className="form-input" required placeholder="John Doe" />
        </div>
        <div className="form-group">
          <label className="form-label">Sex</label>
          <select name="sex" className="form-input">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Age</label>
          <input type="number" name="age" className="form-input" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label">Location / Department</label>
          <input type="text" name="location" className="form-input" placeholder="e.g. Field Section, Packing" />
        </div>
        <div className="form-group">
          <label className="form-label">Contact Details (Phone)</label>
          <input type="text" name="phone" className="form-input" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label">Emergency Contact Info</label>
          <input type="text" name="emergencyContact" className="form-input" placeholder="Name - Phone" />
        </div>
        <div className="form-group">
          <label className="form-label">Blood Group</label>
          <input type="text" name="bloodGroup" className="form-input" placeholder="O+, AB-, etc." />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Full Address</label>
        <textarea name="address" className="form-input" rows={2}></textarea>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label">Fixed Wages (Monthly/Weekly)</label>
          <input type="number" step="0.01" name="wages" className="form-input" placeholder="0.00" />
        </div>
        <div className="form-group">
          <label className="form-label">Wages per Hour (OT Rate)</label>
          <input type="number" step="0.01" name="wagesPerHour" className="form-input" placeholder="0.00" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Remarks / Additional Info</label>
        <textarea name="remarks" className="form-input" rows={2}></textarea>
      </div>

      <button type="submit" className="btn" disabled={isSubmitting} style={{ marginTop: '0.5rem' }}>
        {isSubmitting ? 'Registering...' : 'Add Employee to Master'}
      </button>
    </form>
  );
}
