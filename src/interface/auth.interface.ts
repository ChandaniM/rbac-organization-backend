import { Types } from "mongoose";

export interface IUserPayload {
  userId: string | Types.ObjectId;
  tenantId: string;
  roleId?: string;
}

export interface RequestContextUser {
  id: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  tenantId?: string;
  roleId?: string;
  roles?: unknown;
  username: string;
  email: string;
}

export interface RequestContextOrg {
  id: string;
  userId: string;
  name: string;
  display_name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload | RequestContextUser;
      org?: RequestContextOrg;
    }
  }
}