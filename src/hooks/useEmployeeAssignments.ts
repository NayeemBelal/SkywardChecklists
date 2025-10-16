import { useState, useCallback } from 'react';
import { Employee, EmployeeAssignmentDetails, EmployeeAssignmentHierarchy } from '@/types';
import { EmployeeAssignmentService } from '@/services/employeeAssignmentService';

export const useEmployeeAssignments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEmployeesByZone = useCallback(async (zoneId: number): Promise<Employee[]> => {
    try {
      setLoading(true);
      setError(null);
      return await EmployeeAssignmentService.getEmployeesByZone(zoneId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employees by zone';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignEmployeeToZone = useCallback(async (employeeId: number, zoneId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await EmployeeAssignmentService.assignEmployeeToZone(employeeId, zoneId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign employee to zone';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeEmployeeFromZone = useCallback(async (employeeId: number, zoneId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await EmployeeAssignmentService.removeEmployeeFromZone(employeeId, zoneId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove employee from zone';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEmployeesByRoom = useCallback(async (roomId: number): Promise<Employee[]> => {
    try {
      setLoading(true);
      setError(null);
      return await EmployeeAssignmentService.getEmployeesByRoom(roomId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employees by room';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignEmployeeToRoom = useCallback(async (employeeId: number, roomId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await EmployeeAssignmentService.assignEmployeeToRoom(employeeId, roomId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign employee to room';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeEmployeeFromRoom = useCallback(async (employeeId: number, roomId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await EmployeeAssignmentService.removeEmployeeFromRoom(employeeId, roomId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove employee from room';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEmployeeAssignments = useCallback(async (employeeId: number): Promise<EmployeeAssignmentDetails> => {
    try {
      setLoading(true);
      setError(null);
      return await EmployeeAssignmentService.getEmployeeAssignments(employeeId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employee assignments';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEmployeeAssignmentHierarchy = useCallback(async (employeeId: number): Promise<EmployeeAssignmentHierarchy> => {
    try {
      setLoading(true);
      setError(null);
      return await EmployeeAssignmentService.getEmployeeAssignmentHierarchy(employeeId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employee assignment hierarchy';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllEmployeesWithAssignmentStatus = useCallback(async (siteId: number, assignedPage: number = 1, unassignedPage: number = 1, pageSize: number = 10): Promise<{
    assigned: Employee[],
    unassigned: Employee[],
    assignedTotal: number,
    unassignedTotal: number,
    assignedTotalPages: number,
    unassignedTotalPages: number,
    assignedCurrentPage: number,
    unassignedCurrentPage: number
  }> => {
    try {
      setLoading(true);
      setError(null);
      return await EmployeeAssignmentService.getAllEmployeesWithAssignmentStatus(siteId, assignedPage, unassignedPage, pageSize);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employees with assignment status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEmployeesWithZoneAssignmentStatus = useCallback(async (zoneId: number, assignedPage: number = 1, unassignedPage: number = 1, pageSize: number = 10): Promise<{
    assigned: Employee[],
    unassigned: Employee[],
    assignedTotal: number,
    unassignedTotal: number,
    assignedTotalPages: number,
    unassignedTotalPages: number,
    assignedCurrentPage: number,
    unassignedCurrentPage: number
  }> => {
    try {
      setLoading(true);
      setError(null);
      return await EmployeeAssignmentService.getEmployeesWithZoneAssignmentStatus(zoneId, assignedPage, unassignedPage, pageSize);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employees with zone assignment status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Keep these methods for backward compatibility
  const getAssignedEmployees = useCallback(async (siteId: number): Promise<Employee[]> => {
    try {
      setLoading(true);
      setError(null);
      return await EmployeeAssignmentService.getAssignedEmployees(siteId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assigned employees';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUnassignedEmployees = useCallback(async (siteId: number): Promise<Employee[]> => {
    try {
      setLoading(true);
      setError(null);
      return await EmployeeAssignmentService.getUnassignedEmployees(siteId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch unassigned employees';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchEmployees = useCallback(async (query: string): Promise<Employee[]> => {
    try {
      setLoading(true);
      setError(null);
      return await EmployeeAssignmentService.searchEmployees(query);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search employees';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getEmployeesByZone,
    assignEmployeeToZone,
    removeEmployeeFromZone,
    getEmployeesByRoom,
    assignEmployeeToRoom,
    removeEmployeeFromRoom,
    getEmployeeAssignments,
    getEmployeeAssignmentHierarchy,
    getAllEmployeesWithAssignmentStatus,
    getEmployeesWithZoneAssignmentStatus,
    getAssignedEmployees,
    getUnassignedEmployees,
    searchEmployees,
  };
};
