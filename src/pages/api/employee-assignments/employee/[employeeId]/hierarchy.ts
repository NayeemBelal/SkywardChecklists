import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { EmployeeAssignmentRepository } from '@/lib/repositories/employeeAssignmentRepository';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const repository = new EmployeeAssignmentRepository();

  try {
    const { employeeId } = req.query;
    const employeeIdNum = parseInt(employeeId as string);

    if (isNaN(employeeIdNum)) {
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }

    switch (req.method) {
      case 'GET':
        const hierarchy = await repository.getEmployeeAssignmentHierarchy(employeeIdNum);
        res.status(200).json(hierarchy);
        break;

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Employee Assignment Hierarchy API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

