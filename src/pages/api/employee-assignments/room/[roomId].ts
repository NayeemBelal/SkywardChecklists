import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { EmployeeAssignmentRepository } from '@/lib/repositories/employeeAssignmentRepository';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const assignmentRepository = new EmployeeAssignmentRepository();

  try {
    const { roomId } = req.query;
    const roomIdNum = parseInt(roomId as string);

    if (isNaN(roomIdNum)) {
      res.status(400).json({ error: 'Invalid room ID' });
      return;
    }

    switch (req.method) {
      case 'GET':
        const assignedEmployees = await assignmentRepository.getEmployeesByRoom(roomIdNum);
        res.status(200).json(assignedEmployees);
        break;

      case 'POST':
        const { employee_id } = req.body;
        if (!employee_id || isNaN(parseInt(employee_id))) {
          res.status(400).json({ error: 'Valid employee_id is required' });
          return;
        }
        await assignmentRepository.assignEmployeeToRoom(parseInt(employee_id), roomIdNum);
        res.status(201).json({ message: 'Employee assigned to room successfully' });
        break;

      case 'DELETE':
        const { employee_id: deleteEmployeeId } = req.body;
        if (!deleteEmployeeId || isNaN(parseInt(deleteEmployeeId))) {
          res.status(400).json({ error: 'Valid employee_id is required' });
          return;
        }
        await assignmentRepository.removeEmployeeFromRoom(parseInt(deleteEmployeeId), roomIdNum);
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Room Assignment API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
