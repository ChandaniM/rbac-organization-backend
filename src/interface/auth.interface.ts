import { Types } from "mongoose";

export interface IUserPayload {
  userId: string | Types.ObjectId;
  tenantId: string;
  roleId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}