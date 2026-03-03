import * as dashboardRepo from '../repo/dashboard.repo';

/**
 * Dashboard Service
 * Provides business logic for dashboard metrics based on user role
 */

/**
 * Interface for SYSTEM_ADMIN metrics response
 */
export interface SystemAdminMetrics {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
}

/**
 * Interface for org_admin metrics response
 */
export interface OrgAdminMetrics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

/**
 * Interface for org_admin dashboard response
 */
export interface OrgAdminDashboardResponse {
  tenantId: string;
  orgName: string;
  metrics: OrgAdminMetrics;
}

/**
 * Get dashboard metrics for SYSTEM_ADMIN role
 * Returns platform-wide tenant statistics
 * @returns Promise<SystemAdminMetrics> - Total, active, and inactive tenant counts
 */
export const getSystemAdminMetrics = async (): Promise<SystemAdminMetrics> => {
  const [totalTenants, activeTenants, inactiveTenants] = await Promise.all([
    dashboardRepo.countAllTenants(),
    dashboardRepo.countActiveTenants(),
    dashboardRepo.countInactiveTenants(),
  ]);

  return {
    totalTenants,
    activeTenants,
    inactiveTenants,
  };
};

/**
 * Get dashboard metrics for org_admin role
 * Returns organization-scoped user statistics
 * @param tenantId - The tenant ID to get metrics for
 * @returns Promise<OrgAdminDashboardResponse> - Tenant info and user metrics
 * @throws Error if organization is not found
 */
export const getOrgAdminMetrics = async (
  tenantId: string,
): Promise<OrgAdminDashboardResponse> => {
  // Get organization name first to validate tenant exists
  const orgName = await dashboardRepo.getOrgNameByTenantId(tenantId);

  if (!orgName) {
    throw new Error('Organization not found');
  }

  // Get user metrics for the tenant
  const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
    dashboardRepo.countUsersByTenant(tenantId),
    dashboardRepo.countActiveUsersByTenant(tenantId),
    dashboardRepo.countInactiveUsersByTenant(tenantId),
  ]);

  return {
    tenantId,
    orgName,
    metrics: {
      totalUsers,
      activeUsers,
      inactiveUsers,
    },
  };
};
