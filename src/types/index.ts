// Site types
export interface Site {
  id: number;
  name: string;
  pin_hash: string; // This is the hashed version stored in DB
}

// Site creation/update types (for forms)
export interface SiteFormData {
  name: string;
  pin: string; // This is the plain 6-digit PIN from user input
}

// Employee types
export interface Employee {
  id: number;
  full_name: string;
}

// Zone types
export interface Zone {
  id: number;
  site_id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Room types
export interface Room {
  id: number;
  zone_id: number;
  name: string;
  description?: string;
  room_template_id?: number | null;
  created_at: string;
  updated_at: string;
}

// Task types
export interface Task {
  id: number;
  room_id: number | null; // Can be null for template tasks
  description: string;
  description_es?: string | null;
  task_description?: string;
  sort_order: number;
  template_id?: number;
  room_template_id?: number | null;
  is_template_task?: boolean;
  created_at: string;
  updated_at: string;
}

// Task creation/update types (for forms)
export interface TaskFormData {
  room_id: number;
  description: string;
  description_es?: string | null;
  task_description?: string;
  sort_order?: number;
  template_id?: number;
}

// Task Template types
export interface TaskTemplate {
  id: number;
  name: string;
  description: string;
  description_es?: string | null;
  created_at: string;
  updated_at: string;
}

// Task Template creation/update types (for forms)
export interface TaskTemplateFormData {
  name: string;
  description: string;
  description_es?: string | null;
}

// Room Template types
export interface RoomTemplate {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Room Template with tasks
export interface RoomTemplateWithTasks extends RoomTemplate {
  tasks: RoomTemplateTask[];
}

// Room Template Task types
export interface RoomTemplateTask {
  id: number;
  room_template_id: number;
  description: string;
  description_es?: string | null;
  task_description?: string;
  sort_order: number;
  room_id?: number | null; // Can be null for template tasks
  is_template_task?: boolean;
  created_at: string;
  updated_at: string;
}

// Room Template creation/update types (for forms)
export interface RoomTemplateFormData {
  name: string;
  description?: string;
}

// Room Template Task creation/update types (for forms)
export interface RoomTemplateTaskFormData {
  description: string;
  description_es?: string | null;
  task_description?: string;
  sort_order?: number;
}

// Task Assignment types
export interface TaskAssignment {
  id: number;
  task_id: number;
  employee_id: number;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Employee Assignment types
export interface EmployeeAssignment {
  id: number;
  employee_id: number;
  zone_id?: number;
  room_id?: number;
  assigned_at: string;
}

export interface EmployeeAssignmentDetails {
  employee: Employee;
  zone_assignments: Zone[];
  room_assignments: Room[];
  task_assignments: Task[];
}

export interface EmployeeAssignmentHierarchy {
  employee: Employee;
  sites: {
    site: Site;
    zones: {
      zone: Zone;
      rooms: {
        room: Room;
        tasks: Task[];
      }[];
    }[];
  }[];
}

// Employee Checklist types
export interface EmployeeChecklist {
  site: Site;
  employee: Employee;
  zones: {
    zone: Zone;
    rooms: {
      room: Room;
      tasks: Task[];
    }[];
  }[];
}

