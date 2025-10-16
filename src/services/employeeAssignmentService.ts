import { Employee, EmployeeAssignmentDetails, EmployeeAssignmentHierarchy } from '@/types';

const API_BASE = '/api';

export class EmployeeAssignmentService {
  // Zone assignment operations
  static async getEmployeesByZone(zoneId: number): Promise<Employee[]> {
    const response = await fetch(`${API_BASE}/employee-assignments/zone/${zoneId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch employees by zone');
    }
    
    return response.json();
  }

  static async assignEmployeeToZone(employeeId: number, zoneId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/employee-assignments/zone/${zoneId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
      body: JSON.stringify({ employee_id: employeeId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to assign employee to zone');
    }
  }

  static async removeEmployeeFromZone(employeeId: number, zoneId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/employee-assignments/zone/${zoneId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
      body: JSON.stringify({ employee_id: employeeId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove employee from zone');
    }
  }

  // Room assignment operations
  static async getEmployeesByRoom(roomId: number): Promise<Employee[]> {
    const response = await fetch(`${API_BASE}/employee-assignments/room/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch employees by room');
    }
    
    return response.json();
  }

  static async assignEmployeeToRoom(employeeId: number, roomId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/employee-assignments/room/${roomId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
      body: JSON.stringify({ employee_id: employeeId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to assign employee to room');
    }
  }

  static async removeEmployeeFromRoom(employeeId: number, roomId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/employee-assignments/room/${roomId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
      body: JSON.stringify({ employee_id: employeeId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove employee from room');
    }
  }

  // Employee details
  static async getEmployeeAssignments(employeeId: number): Promise<EmployeeAssignmentDetails> {
    const response = await fetch(`${API_BASE}/employee-assignments/employee/${employeeId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch employee assignments');
    }
    
    return response.json();
  }

  static async getEmployeeAssignmentHierarchy(employeeId: number): Promise<EmployeeAssignmentHierarchy> {
    const response = await fetch(`${API_BASE}/employee-assignments/employee/${employeeId}/hierarchy`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch employee assignment hierarchy');
    }
    
    return response.json();
  }

  // Site-based employee operations
  static async getAllEmployeesWithAssignmentStatus(siteId: number, assignedPage: number = 1, unassignedPage: number = 1, pageSize: number = 10): Promise<{
    assigned: Employee[],
    unassigned: Employee[],
    assignedTotal: number,
    unassignedTotal: number,
    assignedTotalPages: number,
    unassignedTotalPages: number,
    assignedCurrentPage: number,
    unassignedCurrentPage: number
  }> {
    const response = await fetch(`${API_BASE}/employees/with-assignment-status/${siteId}?assignedPage=${assignedPage}&unassignedPage=${unassignedPage}&pageSize=${pageSize}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employees with assignment status');
    }

    return response.json();
  }

  static async getEmployeesWithZoneAssignmentStatus(zoneId: number, assignedPage: number = 1, unassignedPage: number = 1, pageSize: number = 10): Promise<{
    assigned: Employee[],
    unassigned: Employee[],
    assignedTotal: number,
    unassignedTotal: number,
    assignedTotalPages: number,
    unassignedTotalPages: number,
    assignedCurrentPage: number,
    unassignedCurrentPage: number
  }> {
    const response = await fetch(`${API_BASE}/employees/with-zone-assignment-status/${zoneId}?assignedPage=${assignedPage}&unassignedPage=${unassignedPage}&pageSize=${pageSize}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employees with zone assignment status');
    }

    return response.json();
  }

  // Keep these methods for backward compatibility
  static async getAssignedEmployees(siteId: number): Promise<Employee[]> {
    const { assigned } = await this.getAllEmployeesWithAssignmentStatus(siteId);
    return assigned;
  }

  static async getUnassignedEmployees(siteId: number): Promise<Employee[]> {
    const { unassigned } = await this.getAllEmployeesWithAssignmentStatus(siteId);
    return unassigned;
  }

  // Search employees (using existing employees API)
  static async searchEmployees(query: string): Promise<Employee[]> {
    const response = await fetch(`${API_BASE}/employees?search=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to search employees');
    }
    
    return response.json();
  }
}
