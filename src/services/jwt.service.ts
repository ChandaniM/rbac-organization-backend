import jwt from "jsonwebtoken";
import { IUserPayload } from "../interface/auth.interface";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

export class JwtService {
  // Generates a token after login
  static generateToken(payload: IUserPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  }

  // Verifies the token from the header
  static verifyToken(token: string): IUserPayload {
    return jwt.verify(token, JWT_SECRET) as IUserPayload;
  }
}