import { Request, Response } from 'express';
import {
  getSystemAdminMetrics,
  getOrgAdminMetrics,
} from '../services/dashboard.service';

const ADMIN_ROLES = ['SYSTEM_ADMIN', 'org_admin'];

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {

    console.log("getDashboardMetrics");
    
    const user = req.user as {
      tenantId: string;
      roles?: { name: string };
    };

    const role = user?.roles?.name;
    const tenantId = user?.tenantId;

    if (!role || !ADMIN_ROLES.includes(role)) {
      return res.status(403).json({
        message: 'Access Denied: Dashboard access requires admin privileges',
      });
    }

    if (role === 'SYSTEM_ADMIN') {
      const metrics = await getSystemAdminMetrics();
      return res.status(200).json({ metrics });
    }

    if (!tenantId) {
      return res.status(400).json({
        message: 'Tenant ID is required for org_admin dashboard',
      });
    }

    const orgAdminResponse = await getOrgAdminMetrics(tenantId);
    return res.status(200).json(orgAdminResponse);
  } catch (error: any) {
    if (error.message === 'Organization not found') {
      return res.status(404).json({
        message: 'Organization not found',
      });
    }

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};
