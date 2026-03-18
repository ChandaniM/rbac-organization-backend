import { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwt.service";
import { RolePermission } from "../models/role-permission.model"; // Your model

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = JwtService.verifyToken(token);
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Permission Checker
export const checkPermission = (permissionId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthenticated" });

      // Check if this specific tenant/role combination has the permission
      const hasAccess = await RolePermission.findOne({
        tenantId: req.user.tenantId,
        role_id: req.user.roleId,
        permission_id: permissionId,
      });

      if (!hasAccess && req.user.tenantId !== "SYSTEM_GLOBAL_ORG") {
        return res.status(403).json({ message: "Access Denied: Insufficient Permissions" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
};

/**
 * Ensures the caller is an `ORG_ADMIN` for the `:tenantId` route param.
 * Allows `SYSTEM_ADMIN` to operate across tenants (optional).
 */
export const requireOrgAdminForTenantParam = (paramName: string = "tenantId") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user) return res.status(401).json({ message: "Unauthenticated" });

    const roleName: string | undefined = user?.roles?.name ?? user?.role ?? user?.roleName;
    const normalizedRole = roleName ? String(roleName).toUpperCase() : undefined;

    const requestedTenantId = req.params?.[paramName];
    const userTenantId = user?.tenantId;

    if (!requestedTenantId) {
      return res.status(400).json({ message: `Missing route param: ${paramName}` });
    }

    // Allow system admin to operate across tenants
    if (normalizedRole === "SYSTEM_ADMIN") return next();

    if (normalizedRole !== "ORG_ADMIN") {
      return res.status(403).json({ message: "Access denied: ORG_ADMIN role required" });
    }

    if (!userTenantId || String(userTenantId) !== String(requestedTenantId)) {
      return res.status(403).json({ message: "Access denied: tenant mismatch" });
    }

    return next();
  };
};