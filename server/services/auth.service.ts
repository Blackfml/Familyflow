import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError } from "../types/errors";

interface TokenPayload {
  uid: string;
  name: string;
  email?: string;
}

export const authService = {
  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
  },

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch {
      throw new UnauthorizedError("Token inválido ou expirado");
    }
  },

  async validateFirebaseToken(idToken: string): Promise<TokenPayload> {
    try {
      const { getAuth } = require("firebase-admin/auth");
      const decoded = await getAuth().verifyIdToken(idToken);
      return {
        uid: decoded.uid,
        name: decoded.name || decoded.email?.split("@")[0] || "Usuário",
        email: decoded.email,
      };
    } catch {
      throw new UnauthorizedError("Token Firebase inválido");
    }
  },
};
