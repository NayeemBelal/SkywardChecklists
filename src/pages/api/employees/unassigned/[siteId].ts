import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { EmployeeAssignmentRepository } from '@/lib/repositories/employeeAssignmentRepository';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const assignmentRepository = new EmployeeAssignmentRepository();

  try {
    const { siteId } = req.query;
    const siteIdNum = parseInt(siteId as string);

    if (isNaN(siteIdNum)) {
      res.status(400).json({ error: 'Invalid site ID' });
      return;
    }

    switch (req.method) {
      case 'GET':
        const unassignedEmployees = await assignmentRepository.getUnassignedEmployees(siteIdNum);
        res.status(200).json(unassignedEmployees);
        break;

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Unassigned Employees API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
