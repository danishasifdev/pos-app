import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { isAccountSessionActive } from "./db";
import { UserRole } from "./types";

export const SESSION_COOKIE = "mall_pos_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 12;

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
};

type SessionPayload = SessionUser & { expiresAt: number };

export function isDemoMode() {
  return !process.env.POS_USERNAME && !process.env.POS_PASSWORD;
}

export function hasSessionSecret() {
  return Boolean(
    process.env.APP_SESSION_SECRET || process.env.NODE_ENV === "development",
  );
}

function sessionSecret() {
  const configured = process.env.APP_SESSION_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV === "development") {
    return "development-only-session-secret-change-for-deployment";
  }
  throw new Error("APP_SESSION_SECRET must be configured.");
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(user: SessionUser) {
  const payload: SessionPayload = {
    ...user,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function readSessionToken(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const [encoded, suppliedSignature, ...extra] = token.split(".");
  if (!encoded || !suppliedSignature || extra.length) return null;

  try {
    const expected = Buffer.from(sign(encoded), "base64url");
    const supplied = Buffer.from(suppliedSignature, "base64url");
    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (
      typeof payload.id !== "string" ||
      typeof payload.email !== "string" ||
      !["admin", "user", "demo"].includes(payload.role) ||
      !Number.isSafeInteger(payload.expiresAt) ||
      payload.expiresAt <= Date.now() / 1000
    ) {
      return null;
    }
    return {
      id: payload.id,
      email: payload.role === "demo" ? "pos-app@demo.com" : payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (session) {
    if (await isAccountSessionActive(session.id, session.role)) return session;
  }
  return null;
}
