import { Organization } from '../models/organization.model';
import { User } from '../models/user.model';

/**
 * Dashboard Repository
 * Provides data access methods for dashboard metrics
 */

// ============================================
// Tenant (Organization) Counting Methods
// ============================================

/**
 * Count all tenants (organizations) that are not deleted
 * @returns Total count of non-deleted organizations
 */
export const countAllTenants = async (): Promise<number> => {
  return Organization.countDocuments({ is_deleted: false });
};

/**
 * Count active tenants (organizations with status 'active' and not deleted)
 * @returns Count of active organizations
 */
export const countActiveTenants = async (): Promise<number> => {
  return Organization.countDocuments({
    status: 'active',
    is_deleted: false,
  });
};

/**
 * Count inactive tenants (organizations with status 'inactive' or 'suspended' and not deleted)
 * @returns Count of inactive/suspended organizations
 */
export const countInactiveTenants = async (): Promise<number> => {
  return Organization.countDocuments({
    status: { $in: ['inactive', 'suspended'] },
    is_deleted: false,
  });
};

// ============================================
// User Counting Methods (for org_admin metrics)
// ============================================

/**
 * Count all users within a specific tenant
 * @param tenantId - The tenant ID to filter users by
 * @returns Total count of users in the tenant
 */
export const countUsersByTenant = async (tenantId: string): Promise<number> => {
  return User.countDocuments({ tenantId });
};

/**
 * Count active users within a specific tenant
 * @param tenantId - The tenant ID to filter users by
 * @returns Count of active users (is_active = true) in the tenant
 */
export const countActiveUsersByTenant = async (
  tenantId: string,
): Promise<number> => {
  return User.countDocuments({ tenantId, is_active: true });
};

/**
 * Count inactive users within a specific tenant
 * @param tenantId - The tenant ID to filter users by
 * @returns Count of inactive users (is_active = false) in the tenant
 */
export const countInactiveUsersByTenant = async (
  tenantId: string,
): Promise<number> => {
  return User.countDocuments({ tenantId, is_active: false });
};

/**
 * Get organization name by tenant ID
 * @param tenantId - The tenant ID (organization _id as string)
 * @returns Organization name or null if not found
 */
export const getOrgNameByTenantId = async (
  tenantId: string,
): Promise<string | null> => {
  const org = await Organization.findById(tenantId).select('name').lean();
  return org?.name ?? null;
};
