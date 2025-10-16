import React from 'react';
import { Employee } from '@skyward/shared';

interface UnassignedEmployeeListProps {
  employees: Employee[];
  onAssignEmployee: (employee: Employee) => void;
  loading?: boolean;
  title?: string;
}

export const UnassignedEmployeeList: React.FC<UnassignedEmployeeListProps> = ({
  employees,
  onAssignEmployee,
  loading = false,
  title = "Unassigned Employees"
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {title} ({employees.length})
      </h3>
      
      {employees.length > 0 ? (
        <div className="space-y-3">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{employee.full_name}</div>
              </div>
              
              <button
                onClick={() => onAssignEmployee(employee)}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Assign
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>All employees are assigned</p>
        </div>
      )}
    </div>
  );
};
