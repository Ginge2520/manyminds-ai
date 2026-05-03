import { SignJWT, jwtVerify } from "jose";
import type { SessionUser, User } from "./types";

export const sessionCookieName = "manyminds_session";

function authSecret() {
  const secret = process.env.AUTH_SECRET || "local-development-secret-change-before-production";
  return new TextEncoder().encode(secret);
}

export function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    onboarded: user.onboarded,
  };
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(authSecret());
}

export async function readSessionToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecret());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}
