import { supabase, getSupabaseAdmin } from '@/lib/supabase';
import { Employee, EmployeeAssignmentDetails, Task, Zone, Room } from '@/types';
import type { EmployeeAssignmentHierarchy } from '@/types';

export class EmployeeAssignmentRepository {
  async assignEmployeeToZone(employeeId: number, zoneId: number): Promise<void> {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('app_zone_employees')
      .insert([{ employee_id: employeeId, zone_id: zoneId }]);

    if (error) throw error;
  }

  async assignEmployeeToRoom(employeeId: number, roomId: number): Promise<void> {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('app_room_employees')
      .insert([{ employee_id: employeeId, room_id: roomId }]);

    if (error) throw error;
  }

  async getEmployeesByZone(zoneId: number): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('app_zone_employees')
      .select(`
        app_employees!inner(id, full_name)
      `)
      .eq('zone_id', zoneId);
    
    if (error) throw error;
    if (!data) return [];
    
    const employees: Employee[] = [];
    for (const item of data) {
      const empData = item.app_employees as unknown;
      if (Array.isArray(empData) && empData.length > 0) {
        employees.push(empData[0] as Employee);
      }
    }
    return employees;
  }

  async getEmployeesByRoom(roomId: number): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('app_room_employees')
      .select(`
        app_employees!inner(id, full_name)
      `)
      .eq('room_id', roomId);
    
    if (error) throw error;
    if (!data) return [];
    
    const employees: Employee[] = [];
    for (const item of data) {
      const empData = item.app_employees as unknown;
      if (Array.isArray(empData) && empData.length > 0) {
        employees.push(empData[0] as Employee);
      }
    }
    return employees;
  }

  async getEmployeeAssignments(employeeId: number): Promise<EmployeeAssignmentDetails> {
    // Get employee info
    const { data: employee, error: employeeError } = await supabase
      .from('app_employees')
      .select('*')
      .eq('id', employeeId)
      .single();
    
    if (employeeError) throw employeeError;

    // Get zone assignments - use a simpler approach
    const { data: zoneAssignments, error: zoneError } = await supabase
      .from('app_zone_employees')
      .select('zone_id')
      .eq('employee_id', employeeId);
    
    if (zoneError) throw zoneError;

    // Get room assignments - use a simpler approach
    const { data: roomAssignments, error: roomError } = await supabase
      .from('app_room_employees')
      .select('room_id')
      .eq('employee_id', employeeId);
    
    if (roomError) throw roomError;

    // Get zone details
    const zoneIds: number[] = zoneAssignments?.map(za => za.zone_id) || [];
    let zones: Zone[] = [];
    if (zoneIds.length > 0) {
      const { data: zoneDetails, error: zoneDetailsError } = await supabase
        .from('app_zones')
        .select('*')
        .in('id', zoneIds);
      
      if (zoneDetailsError) throw zoneDetailsError;
      zones = zoneDetails || [];
    }

    // Get room details
    const roomIds: number[] = roomAssignments?.map(ra => ra.room_id) || [];
    let rooms: Room[] = [];
    if (roomIds.length > 0) {
      const { data: roomDetails, error: roomDetailsError } = await supabase
        .from('app_rooms')
        .select('*')
        .in('id', roomIds);
      
      if (roomDetailsError) throw roomDetailsError;
      rooms = roomDetails || [];
    }
    
    let taskAssignments: Task[] = [];
    if (zoneIds.length > 0 || roomIds.length > 0) {
      // Get tasks from assigned rooms
      if (roomIds.length > 0) {
        const { data: roomTasks, error: roomTaskError } = await supabase
          .from('app_tasks')
          .select('*')
          .in('room_id', roomIds);
        
        if (roomTaskError) throw roomTaskError;
        taskAssignments = (roomTasks || []) as Task[];
      }

      // Get tasks from rooms in assigned zones
      if (zoneIds.length > 0) {
        const { data: zoneRoomTasks, error: zoneRoomTaskError } = await supabase
          .from('app_tasks')
          .select(`
            *,
            app_rooms!inner(zone_id)
          `)
          .in('app_rooms.zone_id', zoneIds);
        
        if (zoneRoomTaskError) throw zoneRoomTaskError;
        const zoneTasks = (zoneRoomTasks || []) as Task[];
        
        // Merge with existing tasks, avoiding duplicates
        const existingTaskIds = new Set(taskAssignments.map(t => t.id));
        const newTasks = zoneTasks.filter(t => !existingTaskIds.has(t.id));
        taskAssignments = [...taskAssignments, ...newTasks];
      }
    }

            return {
              employee,
              zone_assignments: zones,
              room_assignments: rooms,
              task_assignments: taskAssignments
            };
  }

  async getEmployeeAssignmentHierarchy(employeeId: number): Promise<EmployeeAssignmentHierarchy> {
    // Get employee info
    const { data: employee, error: employeeError } = await supabase
      .from('app_employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (employeeError) throw employeeError;

    // Get zone assignments (zones directly assigned to this employee)
    const { data: zoneAssignments, error: zoneError } = await supabase
      .from('app_zone_employees')
      .select('zone_id')
      .eq('employee_id', employeeId);

    if (zoneError) throw zoneError;

    const assignedZoneIds = new Set<number>(zoneAssignments?.map(za => za.zone_id) || []);

    // Get room assignments (rooms directly assigned to this employee)
    const { data: roomAssignments, error: roomError } = await supabase
      .from('app_room_employees')
      .select('room_id')
      .eq('employee_id', employeeId);

    if (roomError) throw roomError;

    const assignedRoomIds = new Set<number>(roomAssignments?.map(ra => ra.room_id) || []);

    // If no assignments at all, return empty
    if (assignedZoneIds.size === 0 && assignedRoomIds.size === 0) {
      return {
        employee,
        sites: []
      };
    }

    // Get all rooms that are assigned (to fetch their zone_id)
    let assignedRooms: Room[] = [];
    if (assignedRoomIds.size > 0) {
      const { data: roomsData, error: roomsDataError } = await supabase
        .from('app_rooms')
        .select('*')
        .in('id', Array.from(assignedRoomIds));

      if (roomsDataError) throw roomsDataError;
      assignedRooms = roomsData || [];
    }

    // Combine zone IDs: directly assigned zones + zones that contain assigned rooms
    const allRelevantZoneIds = new Set<number>([
      ...assignedZoneIds,
      ...assignedRooms.map(r => r.zone_id)
    ]);

    // Get zone details
    const { data: zones, error: zonesDetailsError } = await supabase
      .from('app_zones')
      .select('*')
      .in('id', Array.from(allRelevantZoneIds));

    if (zonesDetailsError) throw zonesDetailsError;

    // Group zones by site_id
    const siteIds = [...new Set(zones?.map(z => z.site_id) || [])];

    // Get site details
    const { data: sites, error: sitesError } = await supabase
      .from('app_sites')
      .select('*')
      .in('id', siteIds);

    if (sitesError) throw sitesError;

    // Get all rooms for these zones
    const { data: allRooms, error: allRoomsError } = await supabase
      .from('app_rooms')
      .select('*')
      .in('zone_id', Array.from(allRelevantZoneIds));

    if (allRoomsError) throw allRoomsError;

    // Get all tasks for assigned rooms only
    let tasks: Task[] = [];
    if (assignedRoomIds.size > 0) {
      const { data: tasksData, error: tasksError } = await supabase
        .from('app_tasks')
        .select('*')
        .in('room_id', Array.from(assignedRoomIds))
        .order('sort_order');

      if (tasksError) throw tasksError;
      tasks = tasksData || [];
    }

    // Build hierarchy
    const hierarchy: EmployeeAssignmentHierarchy = {
      employee,
      sites: (sites || []).map(site => ({
        site,
        zones: (zones || [])
          .filter(zone => zone.site_id === site.id)
          .map(zone => ({
            zone,
            isDirectlyAssigned: assignedZoneIds.has(zone.id),
            rooms: (allRooms || [])
              .filter(room => room.zone_id === zone.id && assignedRoomIds.has(room.id))
              .map(room => ({
                room,
                isDirectlyAssigned: assignedRoomIds.has(room.id),
                tasks: tasks.filter(task => task.room_id === room.id)
              }))
          }))
          // Only include zones that are either directly assigned or have assigned rooms
          .filter(zoneData => zoneData.isDirectlyAssigned || zoneData.rooms.length > 0)
      }))
    };

    return hierarchy;
  }

  async getAllEmployeesWithAssignmentStatus(siteId: number, assignedPage: number = 1, unassignedPage: number = 1, pageSize: number = 10): Promise<{ 
    assigned: Employee[], 
    unassigned: Employee[], 
    assignedTotal: number,
    unassignedTotal: number,
    assignedTotalPages: number,
    unassignedTotalPages: number,
    assignedCurrentPage: number,
    unassignedCurrentPage: number
  }> {
    // Get all employees first (we need to determine assignment status)
    const { data: allEmployees, error: allError } = await supabase
      .from('app_employees')
      .select('*')
      .order('full_name');
    
    if (allError) throw allError;

    if (!allEmployees || allEmployees.length === 0) {
      return { 
        assigned: [], 
        unassigned: [], 
        assignedTotal: 0, 
        unassignedTotal: 0, 
        assignedTotalPages: 0, 
        unassignedTotalPages: 0, 
        assignedCurrentPage: 1, 
        unassignedCurrentPage: 1 
      };
    }

    // Get all zones for this site
    const { data: zones, error: zonesError } = await supabase
      .from('app_zones')
      .select('id')
      .eq('site_id', siteId);
    
    if (zonesError) throw zonesError;

    // Get all rooms for zones in this site
    const { data: rooms, error: roomsError } = await supabase
      .from('app_rooms')
      .select('id')
      .in('zone_id', zones?.map(z => z.id) || []);
    
    if (roomsError) throw roomsError;

    const zoneIds = zones?.map(z => z.id) || [];
    const roomIds = rooms?.map(r => r.id) || [];

    // Get all assigned employee IDs for this site
    const assignedEmployeeIds = new Set<number>();

    // Get employees assigned to zones in this site
    if (zoneIds.length > 0) {
      const { data: zoneEmpData, error: zoneError } = await supabase
        .from('app_zone_employees')
        .select('employee_id')
        .in('zone_id', zoneIds);
      
      if (zoneError) throw zoneError;

      if (zoneEmpData) {
        zoneEmpData.forEach(item => assignedEmployeeIds.add(item.employee_id));
      }
    }

    // Get employees assigned to rooms in this site
    if (roomIds.length > 0) {
      const { data: roomEmpData, error: roomError } = await supabase
        .from('app_room_employees')
        .select('employee_id')
        .in('room_id', roomIds);
      
      if (roomError) throw roomError;

      if (roomEmpData) {
        roomEmpData.forEach(item => assignedEmployeeIds.add(item.employee_id));
      }
    }

    // Split employees into assigned and unassigned
    const allAssigned: Employee[] = [];
    const allUnassigned: Employee[] = [];

    allEmployees.forEach(emp => {
      if (assignedEmployeeIds.has(emp.id)) {
        allAssigned.push(emp);
      } else {
        allUnassigned.push(emp);
      }
    });

    // Calculate pagination for assigned employees
    const assignedTotal = allAssigned.length;
    const assignedTotalPages = Math.ceil(assignedTotal / pageSize);
    const assignedOffset = (assignedPage - 1) * pageSize;
    const assigned = allAssigned.slice(assignedOffset, assignedOffset + pageSize);

    // Calculate pagination for unassigned employees
    const unassignedTotal = allUnassigned.length;
    const unassignedTotalPages = Math.ceil(unassignedTotal / pageSize);
    const unassignedOffset = (unassignedPage - 1) * pageSize;
    const unassigned = allUnassigned.slice(unassignedOffset, unassignedOffset + pageSize);

    return { 
      assigned, 
      unassigned, 
      assignedTotal, 
      unassignedTotal, 
      assignedTotalPages, 
      unassignedTotalPages, 
      assignedCurrentPage: assignedPage, 
      unassignedCurrentPage: unassignedPage 
    };
  }

  async getEmployeesWithZoneAssignmentStatus(zoneId: number, assignedPage: number = 1, unassignedPage: number = 1, pageSize: number = 10): Promise<{ 
    assigned: Employee[], 
    unassigned: Employee[], 
    assignedTotal: number,
    unassignedTotal: number,
    assignedTotalPages: number,
    unassignedTotalPages: number,
    assignedCurrentPage: number,
    unassignedCurrentPage: number
  }> {
    // Get all employees first (we need to determine assignment status)
    const { data: allEmployees, error: allError } = await supabase
      .from('app_employees')
      .select('*')
      .order('full_name');
    
    if (allError) throw allError;

    if (!allEmployees || allEmployees.length === 0) {
      return { 
        assigned: [], 
        unassigned: [], 
        assignedTotal: 0, 
        unassignedTotal: 0, 
        assignedTotalPages: 0, 
        unassignedTotalPages: 0, 
        assignedCurrentPage: 1, 
        unassignedCurrentPage: 1 
      };
    }

    // Get employees assigned to this specific zone
    const { data: zoneAssignments, error: zoneError } = await supabase
      .from('app_zone_employees')
      .select('employee_id')
      .eq('zone_id', zoneId);
    
    if (zoneError) throw zoneError;

    const assignedEmployeeIds = new Set<number>();
    if (zoneAssignments) {
      zoneAssignments.forEach(item => assignedEmployeeIds.add(item.employee_id));
    }

    // Split employees into assigned and unassigned
    const allAssigned: Employee[] = [];
    const allUnassigned: Employee[] = [];

    allEmployees.forEach(emp => {
      if (assignedEmployeeIds.has(emp.id)) {
        allAssigned.push(emp);
      } else {
        allUnassigned.push(emp);
      }
    });

    // Calculate pagination for assigned employees
    const assignedTotal = allAssigned.length;
    const assignedTotalPages = Math.ceil(assignedTotal / pageSize);
    const assignedOffset = (assignedPage - 1) * pageSize;
    const assigned = allAssigned.slice(assignedOffset, assignedOffset + pageSize);

    // Calculate pagination for unassigned employees
    const unassignedTotal = allUnassigned.length;
    const unassignedTotalPages = Math.ceil(unassignedTotal / pageSize);
    const unassignedOffset = (unassignedPage - 1) * pageSize;
    const unassigned = allUnassigned.slice(unassignedOffset, unassignedOffset + pageSize);

    return { 
      assigned, 
      unassigned, 
      assignedTotal, 
      unassignedTotal, 
      assignedTotalPages, 
      unassignedTotalPages, 
      assignedCurrentPage: assignedPage, 
      unassignedCurrentPage: unassignedPage 
    };
  }

  // Keep these methods for backward compatibility, but they now use the single query
  async getAssignedEmployees(siteId: number): Promise<Employee[]> {
    const { assigned } = await this.getAllEmployeesWithAssignmentStatus(siteId);
    return assigned;
  }

  async getUnassignedEmployees(siteId: number): Promise<Employee[]> {
    const { unassigned } = await this.getAllEmployeesWithAssignmentStatus(siteId);
    return unassigned;
  }

  async removeEmployeeFromZone(employeeId: number, zoneId: number): Promise<void> {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('app_zone_employees')
      .delete()
      .eq('employee_id', employeeId)
      .eq('zone_id', zoneId);
    
    if (error) throw error;
  }

  async removeEmployeeFromRoom(employeeId: number, roomId: number): Promise<void> {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('app_room_employees')
      .delete()
      .eq('employee_id', employeeId)
      .eq('room_id', roomId);

    if (error) throw error;
  }

  async getEmployeesWithRoomAssignmentStatus(roomId: number, assignedPage: number = 1, unassignedPage: number = 1, pageSize: number = 10): Promise<{
    assigned: Employee[],
    unassigned: Employee[],
    assignedTotal: number,
    unassignedTotal: number,
    assignedTotalPages: number,
    unassignedTotalPages: number,
    assignedCurrentPage: number,
    unassignedCurrentPage: number
  }> {
    // Get all employees first (we need to determine assignment status)
    const { data: allEmployees, error: allError } = await supabase
      .from('app_employees')
      .select('*')
      .order('full_name');

    if (allError) throw allError;

    if (!allEmployees || allEmployees.length === 0) {
      return {
        assigned: [],
        unassigned: [],
        assignedTotal: 0,
        unassignedTotal: 0,
        assignedTotalPages: 0,
        unassignedTotalPages: 0,
        assignedCurrentPage: 1,
        unassignedCurrentPage: 1
      };
    }

    // Get employees assigned to this specific room
    const { data: roomAssignments, error: roomError } = await supabase
      .from('app_room_employees')
      .select('employee_id')
      .eq('room_id', roomId);

    if (roomError) throw roomError;

    const assignedEmployeeIds = new Set<number>();
    if (roomAssignments) {
      roomAssignments.forEach(item => assignedEmployeeIds.add(item.employee_id));
    }

    // Split employees into assigned and unassigned
    const allAssigned: Employee[] = [];
    const allUnassigned: Employee[] = [];

    allEmployees.forEach(emp => {
      if (assignedEmployeeIds.has(emp.id)) {
        allAssigned.push(emp);
      } else {
        allUnassigned.push(emp);
      }
    });

    // Calculate pagination for assigned employees
    const assignedTotal = allAssigned.length;
    const assignedTotalPages = Math.ceil(assignedTotal / pageSize);
    const assignedOffset = (assignedPage - 1) * pageSize;
    const assigned = allAssigned.slice(assignedOffset, assignedOffset + pageSize);

    // Calculate pagination for unassigned employees
    const unassignedTotal = allUnassigned.length;
    const unassignedTotalPages = Math.ceil(unassignedTotal / pageSize);
    const unassignedOffset = (unassignedPage - 1) * pageSize;
    const unassigned = allUnassigned.slice(unassignedOffset, unassignedOffset + pageSize);

    return {
      assigned,
      unassigned,
      assignedTotal,
      unassignedTotal,
      assignedTotalPages,
      unassignedTotalPages,
      assignedCurrentPage: assignedPage,
      unassignedCurrentPage: unassignedPage
    };
  }
}
