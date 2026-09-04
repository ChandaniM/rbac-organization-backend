import * as dashboardRepo from '../repo/dashboard.repo';
import CacheService from '../utils/cache.util';
import { deduplicate } from '../utils/request-deduplication.util';

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
  // Request deduplication will merge concurrent calls
  // Cache will serve repeated calls
  return CacheService.remember(
    'system-admin-metrics',
    async () => {
      console.log('[Dashboard] Executing DB query for system admin metrics');
      
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
    },
    { ttl: 300, prefix: 'dashboard' }
  );
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
  // Request deduplication will merge concurrent calls for same tenant
  // Cache will serve repeated calls
  return CacheService.remember(
    `org-admin-metrics:${tenantId}`,
    async () => {
      console.log(`[Dashboard] Executing DB query for tenant: ${tenantId}`);
      
      const orgName = await dashboardRepo.getOrgNameByTenantId(tenantId);

      if (!orgName) {
        throw new Error('Organization not found');
      }

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
    },
    { ttl: 300, prefix: 'dashboard' }
  );
};
