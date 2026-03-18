import * as orgHierarchyRepo from "../repo/orgEmp.repo";

export const assignHierarchy = async (tenantId: string, userId: string, managerId: string) => {
  // tenantId scoping is enforced in the repo query
  return await orgHierarchyRepo.orgEmpRepo.assignHierarchy(tenantId, userId, managerId);
};

export const getHierarchyTree = async (tenantId: string) => {
  return await orgHierarchyRepo.orgEmpRepo.getHierarchyTree(tenantId);
};

