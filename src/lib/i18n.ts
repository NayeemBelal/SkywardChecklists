import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      add: 'Add',
      remove: 'Remove',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
      select: 'Select',
      
      // Navigation
      dashboard: 'Admin Dashboard',
      admin: 'Admin',
      employee: 'Employee',
      logout: 'Logout',
      login: 'Login',
      
      // Admin - Sites
      sites: 'Sites',
      site: 'Site',
      site_name: 'Site Name',
      create_site: 'Create Site',
      edit_site: 'Edit Site',
      delete_site: 'Delete Site',
      site_created: 'Site created successfully!',
      site_updated: 'Site updated successfully!',
      site_deleted: 'Site deleted successfully!',
      no_sites: 'No sites available',
      add_site: 'Add Site',
      
      // Admin - Zones
      zones: 'Zones',
      zone: 'Zone',
      zone_name: 'Zone Name',
      create_zone: 'Create Zone',
      edit_zone: 'Edit Zone',
      delete_zone: 'Delete Zone',
      zone_created: 'Zone created successfully!',
      zone_updated: 'Zone updated successfully!',
      zone_deleted: 'Zone deleted successfully!',
      no_zones: 'No zones available',
      add_zone: 'Add Zone',
      select_zone: 'Select Zone',
      
      // Admin - Rooms
      rooms: 'Rooms',
      room: 'Room',
      room_name: 'Room Name',
      create_room: 'Create Room',
      edit_room: 'Edit Room',
      delete_room: 'Delete Room',
      room_created: 'Room created successfully!',
      room_updated: 'Room updated successfully!',
      room_deleted: 'Room deleted successfully!',
      no_rooms: 'No rooms available',
      add_room: 'Add Room',
      
      // Admin - Tasks
      tasks: 'Tasks',
      task: 'Task',
      task_name: 'Task Name',
      task_description: 'Task Description',
      create_task: 'Create Task',
      edit_task: 'Edit Task',
      delete_task: 'Delete Task',
      task_created: 'Task created successfully!',
      task_updated: 'Task updated successfully!',
      task_deleted: 'Task deleted successfully!',
      no_tasks: 'No tasks available',
      add_task: 'Add Task',
      reorder_tasks: 'Reorder Tasks',
      
      // Admin - Employees
      employees: 'Employees',
      employee_name: 'Employee Name',
      employee_number: 'Employee Number',
      assigned_employees: 'Assigned Employees',
      unassigned_employees: 'Unassigned Employees',
      assign_employee: 'Assign Employee',
      unassign_employee: 'Unassign Employee',
      assign_employees: 'Assign Employees',
      employee_assigned: 'Employee assigned successfully!',
      employee_unassigned: 'Employee unassigned successfully!',
      no_employees: 'No employees available',
      search_employees: 'Search Employees',
      
      // Admin - Templates
      templates: 'Templates',
      template: 'Template',
      template_name: 'Template Name',
      create_template: 'Create Template',
      edit_template: 'Edit Template',
      delete_template: 'Delete Template',
      apply_template: 'Apply Template',
      template_created: 'Template created successfully!',
      template_applied: 'Template applied successfully!',
      
      // Employee Interface
      employee_access: 'Employee Access',
      select_site: 'Select a site',
      select_employee: 'Select an employee',
      checklist: 'Checklist',
      my_tasks: 'My Tasks',
      task_complete: 'Complete',
      task_incomplete: 'Incomplete',
      submit_checklist: 'Submit Checklist',
      checklist_submitted: 'Checklist submitted successfully!',
      
      // Forms
      name: 'Name',
      description: 'Description',
      required: 'Required',
      optional: 'Optional',
      
      // Modals
      confirm_delete: 'Confirm Delete',
      confirm_delete_site: 'Are you sure you want to delete this site?',
      confirm_delete_zone: 'Are you sure you want to delete this zone?',
      confirm_delete_room: 'Are you sure you want to delete this room?',
      confirm_delete_task: 'Are you sure you want to delete this task?',
      this_action_cannot_be_undone: 'This action cannot be undone.',
      
      // Messages
      changes_saved: 'Changes saved successfully!',
      operation_failed: 'Operation failed. Please try again.',
      please_fill_required_fields: 'Please fill in all required fields.',
      no_data_available: 'No data available',
      
      // Employee Assignment
      assignment_details: 'Assignment Details',
      assigned_to: 'Assigned to',
      view_details: 'View Details',
      assignment_hierarchy: 'Assignment Hierarchy',
      
      // Additional keys
      actions: 'Actions',
      password: 'Password',
      email: 'Email',
      sign_in: 'Sign in',
      task_description: 'Task Description',
      no_tasks: 'No tasks',
    }
  },
  es: {
    translation: {
      // Common
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      add: 'Agregar',
      remove: 'Quitar',
      close: 'Cerrar',
      back: 'Atrás',
      next: 'Siguiente',
      submit: 'Enviar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      confirm: 'Confirmar',
      yes: 'Sí',
      no: 'No',
      search: 'Buscar',
      filter: 'Filtrar',
      clear: 'Limpiar',
      select: 'Seleccionar',
      
      // Navigation
      dashboard: 'Panel de Administración',
      admin: 'Administrador',
      employee: 'Empleado',
      logout: 'Cerrar Sesión',
      login: 'Iniciar Sesión',
      
      // Admin - Sites
      sites: 'Sitios',
      site: 'Sitio',
      site_name: 'Nombre del Sitio',
      create_site: 'Crear Sitio',
      edit_site: 'Editar Sitio',
      delete_site: 'Eliminar Sitio',
      site_created: '¡Sitio creado exitosamente!',
      site_updated: '¡Sitio actualizado exitosamente!',
      site_deleted: '¡Sitio eliminado exitosamente!',
      no_sites: 'No hay sitios disponibles',
      add_site: 'Agregar Sitio',
      
      // Admin - Zones
      zones: 'Zonas',
      zone: 'Zona',
      zone_name: 'Nombre de la Zona',
      create_zone: 'Crear Zona',
      edit_zone: 'Editar Zona',
      delete_zone: 'Eliminar Zona',
      zone_created: '¡Zona creada exitosamente!',
      zone_updated: '¡Zona actualizada exitosamente!',
      zone_deleted: '¡Zona eliminada exitosamente!',
      no_zones: 'No hay zonas disponibles',
      add_zone: 'Agregar Zona',
      select_zone: 'Seleccionar Zona',
      
      // Admin - Rooms
      rooms: 'Habitaciones',
      room: 'Habitación',
      room_name: 'Nombre de la Habitación',
      create_room: 'Crear Habitación',
      edit_room: 'Editar Habitación',
      delete_room: 'Eliminar Habitación',
      room_created: '¡Habitación creada exitosamente!',
      room_updated: '¡Habitación actualizada exitosamente!',
      room_deleted: '¡Habitación eliminada exitosamente!',
      no_rooms: 'No hay habitaciones disponibles',
      add_room: 'Agregar Habitación',
      
      // Admin - Tasks
      tasks: 'Tareas',
      task: 'Tarea',
      task_name: 'Nombre de la Tarea',
      task_description: 'Descripción de la Tarea',
      create_task: 'Crear Tarea',
      edit_task: 'Editar Tarea',
      delete_task: 'Eliminar Tarea',
      task_created: '¡Tarea creada exitosamente!',
      task_updated: '¡Tarea actualizada exitosamente!',
      task_deleted: '¡Tarea eliminada exitosamente!',
      no_tasks: 'No hay tareas disponibles',
      add_task: 'Agregar Tarea',
      reorder_tasks: 'Reordenar Tareas',
      
      // Admin - Employees
      employees: 'Empleados',
      employee_name: 'Nombre del Empleado',
      employee_number: 'Número de Empleado',
      assigned_employees: 'Empleados Asignados',
      unassigned_employees: 'Empleados Sin Asignar',
      assign_employee: 'Asignar Empleado',
      unassign_employee: 'Desasignar Empleado',
      assign_employees: 'Asignar Empleados',
      employee_assigned: '¡Empleado asignado exitosamente!',
      employee_unassigned: '¡Empleado desasignado exitosamente!',
      no_employees: 'No hay empleados disponibles',
      search_employees: 'Buscar Empleados',
      
      // Admin - Templates
      templates: 'Plantillas',
      template: 'Plantilla',
      template_name: 'Nombre de la Plantilla',
      create_template: 'Crear Plantilla',
      edit_template: 'Editar Plantilla',
      delete_template: 'Eliminar Plantilla',
      apply_template: 'Aplicar Plantilla',
      template_created: '¡Plantilla creada exitosamente!',
      template_applied: '¡Plantilla aplicada exitosamente!',
      
      // Employee Interface
      employee_access: 'Acceso de Empleado',
      select_site: 'Seleccionar un sitio',
      select_employee: 'Seleccionar un empleado',
      checklist: 'Lista de Verificación',
      my_tasks: 'Mis Tareas',
      task_complete: 'Completa',
      task_incomplete: 'Incompleta',
      submit_checklist: 'Enviar Lista de Verificación',
      checklist_submitted: '¡Lista de verificación enviada exitosamente!',
      
      // Forms
      name: 'Nombre',
      description: 'Descripción',
      required: 'Requerido',
      optional: 'Opcional',
      
      // Modals
      confirm_delete: 'Confirmar Eliminación',
      confirm_delete_site: '¿Está seguro de que desea eliminar este sitio?',
      confirm_delete_zone: '¿Está seguro de que desea eliminar esta zona?',
      confirm_delete_room: '¿Está seguro de que desea eliminar esta habitación?',
      confirm_delete_task: '¿Está seguro de que desea eliminar esta tarea?',
      this_action_cannot_be_undone: 'Esta acción no se puede deshacer.',
      
      // Messages
      changes_saved: '¡Cambios guardados exitosamente!',
      operation_failed: 'Operación fallida. Por favor, inténtelo de nuevo.',
      please_fill_required_fields: 'Por favor, complete todos los campos requeridos.',
      no_data_available: 'No hay datos disponibles',
      
      // Employee Assignment
      assignment_details: 'Detalles de Asignación',
      assigned_to: 'Asignado a',
      view_details: 'Ver Detalles',
      assignment_hierarchy: 'Jerarquía de Asignación',
      
      // Additional keys
      actions: 'Acciones',
      password: 'Contraseña',
      email: 'Correo Electrónico',
      sign_in: 'Iniciar sesión',
      task_description: 'Descripción de la Tarea',
      no_tasks: 'No hay tareas',
    }
  }
};

// Get saved language from localStorage or detect browser language or default to English
const getInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return 'en'; // Default for server-side rendering
  }

  // First priority: saved language from localStorage
  const saved = localStorage.getItem('skyward-checklists-language');
  if (saved && (saved === 'en' || saved === 'es')) {
    return saved;
  }
  
  // Second priority: browser language
  const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
  if (browserLang.startsWith('es')) {
    return 'es';
  }
  
  // Default: English
  return 'en';
};

const savedLanguage = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Listen for language changes and save to localStorage
if (typeof window !== 'undefined') {
  i18n.on('languageChanged', (lng) => {
    localStorage.setItem('skyward-checklists-language', lng);
  });
}

export default i18n;

