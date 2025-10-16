import React, { useState, useEffect } from 'react';
import { Employee } from '@skyward/shared';
import { EmployeeSearchBar } from './EmployeeSearchBar';

interface EmployeeAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (employeeId: number) => Promise<void>;
  employees: Employee[];
  assignmentType: 'zone' | 'room';
  targetName: string;
  onSearchEmployees: (query: string) => void;
}

export const EmployeeAssignmentModal: React.FC<EmployeeAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  employees,
  assignmentType,
  targetName,
  onSearchEmployees
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedEmployee(null);
      setIsAssigning(false);
    }
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selectedEmployee) return;

    try {
      setIsAssigning(true);
      await onAssign(selectedEmployee.id);
      onClose();
    } catch (error) {
      console.error('Assignment error:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Assign Employee to {assignmentType === 'zone' ? 'Zone' : 'Room'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Assigning to: <span className="font-medium">{targetName}</span>
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search and Select Employee
          </label>
          <EmployeeSearchBar
            employees={employees}
            onSearch={onSearchEmployees}
            onSelectEmployee={setSelectedEmployee}
            placeholder="Type employee name..."
          />
        </div>

        {selectedEmployee && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              Selected: <span className="font-medium">{selectedEmployee.full_name}</span>
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isAssigning}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedEmployee || isAssigning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAssigning ? 'Assigning...' : 'Assign Employee'}
          </button>
        </div>
      </div>
    </div>
  );
};
