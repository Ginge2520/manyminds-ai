import { cookies } from "next/headers";
import { createSessionToken, readSessionToken, sessionCookieName } from "./session";
import type { SessionUser } from "./types";

export { readSessionToken, sessionCookieName, toSessionUser } from "./session";

export async function currentUser() {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(sessionCookieName)?.value);
}

export async function setSessionCookie(user: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, await createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}
