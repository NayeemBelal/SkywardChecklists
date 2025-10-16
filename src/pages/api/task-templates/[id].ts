import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { TaskTemplateRepository } from '@/lib/repositories/taskTemplateRepository';
import { getSupabaseAdmin } from '@/lib/supabase';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const templateRepository = new TaskTemplateRepository(supabaseAdmin);

  try {
    const { id } = req.query;
    const templateId = parseInt(id as string);

    if (isNaN(templateId)) {
      res.status(400).json({ error: 'Invalid template ID' });
      return;
    }

    switch (req.method) {
      case 'GET':
        const template = await templateRepository.findById(templateId);
        if (!template) {
          res.status(404).json({ error: 'Template not found' });
          return;
        }
        res.status(200).json(template);
        break;

      case 'PUT':
        const existingTemplate = await templateRepository.findById(templateId);
        if (!existingTemplate) {
          res.status(404).json({ error: 'Template not found' });
          return;
        }

        const { name, description, cascadeUpdate = false } = req.body;
        
        // Prepare update data
        const templateUpdateData: { name?: string; description?: string } = {};
        
        if (name !== undefined) {
          if (!name || name.trim().length < 1) {
            res.status(400).json({ 
              error: 'Name is required and must be at least 1 character' 
            });
            return;
          }
          templateUpdateData.name = name.trim();
        }
        
        if (description !== undefined) {
          if (!description || description.trim().length < 1) {
            res.status(400).json({ 
              error: 'Description is required and must be at least 1 character' 
            });
            return;
          }
          
          // Check for duplicate description (excluding current template)
          const isDuplicate = await templateRepository.checkDuplicateDescription(description.trim(), templateId);
          if (isDuplicate) {
            res.status(400).json({ 
              error: 'A template with this description already exists' 
            });
            return;
          }
          
          templateUpdateData.description = description.trim();
        }

        // Get tasks using this template for cascade update
        const { count: tasksCount } = await templateRepository.getTasksUsingTemplate(templateId);
        
        // If cascade update is requested and there are tasks using this template
        if (cascadeUpdate && tasksCount > 0) {
          // Update all tasks that use this template
          await templateRepository.updateTasksFromTemplate(templateId, templateUpdateData);
        }

        const updatedTemplate = await templateRepository.update(templateId, templateUpdateData);
        
        res.status(200).json({
          ...updatedTemplate,
          cascadeInfo: {
            tasksAffected: tasksCount,
            cascadeUpdate: cascadeUpdate && tasksCount > 0
          }
        });
        break;

      case 'DELETE':
        const templateToDelete = await templateRepository.findById(templateId);
        if (!templateToDelete) {
          res.status(404).json({ error: 'Template not found' });
          return;
        }

        const { cascadeDelete = false } = req.body;
        
        // Get tasks using this template for cascade delete
        const { count: deleteTasksCount } = await templateRepository.getTasksUsingTemplate(templateId);
        
        // If cascade delete is requested and there are tasks using this template
        if (cascadeDelete && deleteTasksCount > 0) {
          // Delete all tasks that use this template
          await templateRepository.deleteTasksFromTemplate(templateId);
        }

        await templateRepository.delete(templateId);
        
        res.status(200).json({
          message: 'Template deleted successfully',
          cascadeInfo: {
            tasksAffected: deleteTasksCount,
            cascadeDelete: cascadeDelete && deleteTasksCount > 0
          }
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Task Template API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
