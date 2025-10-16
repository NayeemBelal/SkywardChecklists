import React from 'react';
import { Employee } from '@skyward/shared';

interface AssignedEmployeeListProps {
  employees: Employee[];
  onRemoveEmployee: (employeeId: number) => Promise<void>;
  onViewDetails: (employeeId: number) => void;
  loading?: boolean;
  title?: string;
}

export const AssignedEmployeeList: React.FC<AssignedEmployeeListProps> = ({
  employees,
  onRemoveEmployee,
  onViewDetails,
  loading = false,
  title = "Assigned Employees"
}) => {
  const [removingIds, setRemovingIds] = React.useState<Set<number>>(new Set());

  const handleRemove = async (employeeId: number) => {
    if (window.confirm('Are you sure you want to remove this employee assignment?')) {
      try {
        setRemovingIds(prev => new Set(prev).add(employeeId));
        await onRemoveEmployee(employeeId);
      } catch (error) {
        console.error('Error removing employee:', error);
      } finally {
        setRemovingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(employeeId);
          return newSet;
        });
      }
    }
  };

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
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewDetails(employee.id)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  View Details
                </button>
                
                <button
                  onClick={() => handleRemove(employee.id)}
                  disabled={removingIds.has(employee.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {removingIds.has(employee.id) ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No employees assigned</p>
        </div>
      )}
    </div>
  );
};
