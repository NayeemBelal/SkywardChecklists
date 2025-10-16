import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { EmployeeAssignmentRepository } from '@/lib/repositories/employeeAssignmentRepository';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const { siteId } = req.query;
    const { assignedPage = '1', unassignedPage = '1', pageSize = '10' } = req.query;
    
    if (!siteId || Array.isArray(siteId)) {
      res.status(400).json({ error: 'Invalid siteId parameter' });
      return;
    }

    const siteIdNum = parseInt(siteId, 10);
    if (isNaN(siteIdNum)) {
      res.status(400).json({ error: 'siteId must be a number' });
      return;
    }

    const assignedPageNum = parseInt(assignedPage as string, 10);
    const unassignedPageNum = parseInt(unassignedPage as string, 10);
    const pageSizeNum = parseInt(pageSize as string, 10);
    
    if (isNaN(assignedPageNum) || assignedPageNum < 1) {
      res.status(400).json({ error: 'assignedPage must be a positive number' });
      return;
    }
    
    if (isNaN(unassignedPageNum) || unassignedPageNum < 1) {
      res.status(400).json({ error: 'unassignedPage must be a positive number' });
      return;
    }
    
    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
      res.status(400).json({ error: 'pageSize must be between 1 and 100' });
      return;
    }

    const repository = new EmployeeAssignmentRepository();
    const result = await repository.getAllEmployeesWithAssignmentStatus(siteIdNum, assignedPageNum, unassignedPageNum, pageSizeNum);

    res.status(200).json(result);
  } catch (error) {
    console.error('Employees with assignment status API Error:', error);
    res.status(500).json({ error: 'Failed to fetch employees with assignment status' });
  }
});
