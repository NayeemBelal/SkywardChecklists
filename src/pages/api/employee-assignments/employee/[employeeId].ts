import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { EmployeeAssignmentRepository } from '@/lib/repositories/employeeAssignmentRepository';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const assignmentRepository = new EmployeeAssignmentRepository();

  try {
    const { employeeId } = req.query;
    const employeeIdNum = parseInt(employeeId as string);

    if (isNaN(employeeIdNum)) {
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }

    switch (req.method) {
      case 'GET':
        const assignmentDetails = await assignmentRepository.getEmployeeAssignments(employeeIdNum);
        res.status(200).json(assignmentDetails);
        break;

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Employee Assignment Details API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
