import React, { useState, useEffect, useCallback } from 'react';
import { Employee, EmployeeAssignmentDetails } from '@/types';
import { EmployeeSearchBar } from './EmployeeSearchBar';
import { EmployeeAssignmentModal } from './EmployeeAssignmentModal';
import { EmployeeAssignmentDetailsModal } from './EmployeeAssignmentDetailsModal';
import { AssignedEmployeeList } from './AssignedEmployeeList';
import { UnassignedEmployeeList } from './UnassignedEmployeeList';

interface EmployeeTabProps {
  siteId: number;
  assignmentType: 'zone' | 'room';
  targetId: number;
  targetName: string;
  onAssignEmployee: (employeeId: number) => Promise<void>;
  onRemoveEmployee: (employeeId: number) => Promise<void>;
  onGetAllEmployeesWithAssignmentStatus: (assignedPage?: number, unassignedPage?: number, pageSize?: number) => Promise<{
    assigned: Employee[],
    unassigned: Employee[],
    assignedTotal: number,
    unassignedTotal: number,
    assignedTotalPages: number,
    unassignedTotalPages: number,
    assignedCurrentPage: number,
    unassignedCurrentPage: number
  }>;
  onGetEmployeeDetails: (employeeId: number) => Promise<EmployeeAssignmentDetails>;
  onSearchEmployees: (query: string) => Promise<Employee[]>;
  hideSearch?: boolean;
}

export const EmployeeTab: React.FC<EmployeeTabProps> = ({
  siteId,
  assignmentType,
  targetId,
  targetName,
  onAssignEmployee,
  onRemoveEmployee,
  onGetAllEmployeesWithAssignmentStatus,
  onGetEmployeeDetails,
  onSearchEmployees,
  hideSearch = false
}) => {
  const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
  const [unassignedEmployees, setUnassignedEmployees] = useState<Employee[]>([]);
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<EmployeeAssignmentDetails | null>(null);
  
  // Pagination state for assigned employees
  const [assignedCurrentPage, setAssignedCurrentPage] = useState(1);
  const [assignedTotalPages, setAssignedTotalPages] = useState(1);
  const [assignedTotalEmployees, setAssignedTotalEmployees] = useState(0);
  
  // Pagination state for unassigned employees
  const [unassignedCurrentPage, setUnassignedCurrentPage] = useState(1);
  const [unassignedTotalPages, setUnassignedTotalPages] = useState(1);
  const [unassignedTotalEmployees, setUnassignedTotalEmployees] = useState(0);
  
  const pageSize = 10;

  const loadEmployees = useCallback(async (assignedPage: number = 1, unassignedPage: number = 1) => {
    try {
      setLoading(true);
      const result = await onGetAllEmployeesWithAssignmentStatus(assignedPage, unassignedPage, pageSize);
      setAssignedEmployees(result.assigned);
      setUnassignedEmployees(result.unassigned);
      setAssignedTotalPages(result.assignedTotalPages);
      setAssignedTotalEmployees(result.assignedTotal);
      setAssignedCurrentPage(result.assignedCurrentPage);
      setUnassignedTotalPages(result.unassignedTotalPages);
      setUnassignedTotalEmployees(result.unassignedTotal);
      setUnassignedCurrentPage(result.unassignedCurrentPage);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  }, [onGetAllEmployeesWithAssignmentStatus, pageSize]);

  useEffect(() => {
    setAssignedCurrentPage(1); // Reset to first page when site or target changes
    setUnassignedCurrentPage(1);
    loadEmployees(1, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, targetId]); // Removed loadEmployees from dependencies to prevent infinite loop

  const handleAssignedPageChange = (page: number) => {
    setAssignedCurrentPage(page);
    loadEmployees(page, unassignedCurrentPage);
  };

  const handleUnassignedPageChange = (page: number) => {
    setUnassignedCurrentPage(page);
    loadEmployees(assignedCurrentPage, page);
  };

  const handleSearch = async (query: string) => {
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await onSearchEmployees(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching employees:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAssignEmployee = async (employeeId: number) => {
    try {
      await onAssignEmployee(employeeId);
      await loadEmployees(assignedCurrentPage, unassignedCurrentPage); // Refresh the lists
    } catch (error) {
      console.error('Error assigning employee:', error);
      throw error;
    }
  };

  const handleRemoveEmployee = async (employeeId: number) => {
    try {
      await onRemoveEmployee(employeeId);
      await loadEmployees(assignedCurrentPage, unassignedCurrentPage); // Refresh the lists
    } catch (error) {
      console.error('Error removing employee:', error);
      throw error;
    }
  };

  const handleViewDetails = async (employeeId: number) => {
    try {
      const details = await onGetEmployeeDetails(employeeId);
      setSelectedEmployeeDetails(details);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error loading employee details:', error);
    }
  };

  const handleQuickAssign = (employee: Employee) => {
    handleAssignEmployee(employee.id);
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      {!hideSearch && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Search Employees</h3>
          <EmployeeSearchBar
            employees={searchResults}
            onSearch={handleSearch}
            onSelectEmployee={handleQuickAssign}
            placeholder="Search employees to assign..."
          />
          {searchLoading && (
            <div className="mt-2 text-sm text-gray-500">Searching...</div>
          )}
        </div>
      )}

      {/* Assignment Modal */}
      <EmployeeAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        onAssign={handleAssignEmployee}
        employees={unassignedEmployees}
        assignmentType={assignmentType}
        targetName={targetName}
        onSearchEmployees={handleSearch}
      />

      {/* Details Modal */}
      <EmployeeAssignmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        assignmentDetails={selectedEmployeeDetails}
      />

      {/* Assigned Employees */}
      <AssignedEmployeeList
        employees={assignedEmployees}
        onRemoveEmployee={handleRemoveEmployee}
        onViewDetails={handleViewDetails}
        loading={loading}
        title={`Assigned to ${assignmentType === 'zone' ? 'Zone' : 'Room'}`}
      />

      {/* Unassigned Employees */}
      <UnassignedEmployeeList
        employees={unassignedEmployees}
        onAssignEmployee={handleQuickAssign}
        loading={loading}
        title="Available Employees"
      />

      {/* Assigned Employees Pagination */}
      {assignedTotalPages > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((assignedCurrentPage - 1) * pageSize) + 1} to {Math.min(assignedCurrentPage * pageSize, assignedTotalEmployees)} of {assignedTotalEmployees} assigned employees
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAssignedPageChange(assignedCurrentPage - 1)}
                disabled={assignedCurrentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, assignedTotalPages) }, (_, i) => {
                let pageNum;
                if (assignedTotalPages <= 5) {
                  pageNum = i + 1;
                } else if (assignedCurrentPage <= 3) {
                  pageNum = i + 1;
                } else if (assignedCurrentPage >= assignedTotalPages - 2) {
                  pageNum = assignedTotalPages - 4 + i;
                } else {
                  pageNum = assignedCurrentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handleAssignedPageChange(pageNum)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      assignedCurrentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handleAssignedPageChange(assignedCurrentPage + 1)}
                disabled={assignedCurrentPage === assignedTotalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unassigned Employees Pagination */}
      {unassignedTotalPages > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((unassignedCurrentPage - 1) * pageSize) + 1} to {Math.min(unassignedCurrentPage * pageSize, unassignedTotalEmployees)} of {unassignedTotalEmployees} unassigned employees
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleUnassignedPageChange(unassignedCurrentPage - 1)}
                disabled={unassignedCurrentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, unassignedTotalPages) }, (_, i) => {
                let pageNum;
                if (unassignedTotalPages <= 5) {
                  pageNum = i + 1;
                } else if (unassignedCurrentPage <= 3) {
                  pageNum = i + 1;
                } else if (unassignedCurrentPage >= unassignedTotalPages - 2) {
                  pageNum = unassignedTotalPages - 4 + i;
                } else {
                  pageNum = unassignedCurrentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handleUnassignedPageChange(pageNum)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      unassignedCurrentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handleUnassignedPageChange(unassignedCurrentPage + 1)}
                disabled={unassignedCurrentPage === unassignedTotalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
