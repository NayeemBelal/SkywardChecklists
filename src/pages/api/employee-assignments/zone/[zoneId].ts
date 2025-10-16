import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { EmployeeAssignmentRepository } from '@/lib/repositories/employeeAssignmentRepository';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const assignmentRepository = new EmployeeAssignmentRepository();

  try {
    const { zoneId } = req.query;
    const zoneIdNum = parseInt(zoneId as string);

    if (isNaN(zoneIdNum)) {
      res.status(400).json({ error: 'Invalid zone ID' });
      return;
    }

    switch (req.method) {
      case 'GET':
        const assignedEmployees = await assignmentRepository.getEmployeesByZone(zoneIdNum);
        res.status(200).json(assignedEmployees);
        break;

      case 'POST':
        const { employee_id } = req.body;
        if (!employee_id || isNaN(parseInt(employee_id))) {
          res.status(400).json({ error: 'Valid employee_id is required' });
          return;
        }
        await assignmentRepository.assignEmployeeToZone(parseInt(employee_id), zoneIdNum);
        res.status(201).json({ message: 'Employee assigned to zone successfully' });
        break;

      case 'DELETE':
        const { employee_id: deleteEmployeeId } = req.body;
        if (!deleteEmployeeId || isNaN(parseInt(deleteEmployeeId))) {
          res.status(400).json({ error: 'Valid employee_id is required' });
          return;
        }
        await assignmentRepository.removeEmployeeFromZone(parseInt(deleteEmployeeId), zoneIdNum);
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Zone Assignment API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
