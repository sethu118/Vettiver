'use client';

export default function MonthPicker({ defaultValue, slug, basePath }: { defaultValue: string, slug: string, basePath: string }) {
  return (
    <input 
      type="month" 
      name="month" 
      defaultValue={defaultValue} 
      className="form-input" 
      style={{ padding: '0.4rem', width: '150px' }}
      onChange={(e) => (e.target.form as HTMLFormElement).submit()}
    />
  );
}
