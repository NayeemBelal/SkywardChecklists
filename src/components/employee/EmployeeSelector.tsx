import React from 'react';
import { Employee } from '@skyward/shared';

interface Props {
  employees: Pick<Employee, 'id' | 'full_name'>[];
  selectedEmployee: number | null;
  onChange: (employeeId: number | null) => void;
  disabled?: boolean;
}

export function EmployeeSelector({ employees, selectedEmployee, onChange, disabled }: Props) {
  return (
    <select
      className="w-full h-11 border border-gray-300 rounded-md px-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      value={selectedEmployee ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      disabled={disabled}
    >
      <option value="">Select an employee</option>
      {employees.map((e) => (
        <option key={e.id} value={e.id}>{e.full_name}</option>
      ))}
    </select>
  );
}


