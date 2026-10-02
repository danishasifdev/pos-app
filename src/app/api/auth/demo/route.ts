import { NextResponse } from "next/server";
import {
  createSessionToken,
  getCurrentUser,
  hasSessionSecret,
  isDemoMode,
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth";
import { isAccountSessionActive } from "@/lib/db";
import { SessionUser } from "@/lib/auth";

export async function POST() {
  if (await getCurrentUser()) {
    return NextResponse.json(
      { error: "Sign out before switching accounts." },
      { status: 409 },
    );
  }
  if (!isDemoMode()) {
    return NextResponse.json(
      { error: "Public demo sign-in is disabled." },
      { status: 404 },
    );
  }
  if (!hasSessionSecret()) {
    return NextResponse.json(
      { error: "APP_SESSION_SECRET must be configured." },
      { status: 503 },
    );
  }

  const user: SessionUser = {
    id: "demo",
    email: "pos-app@demo.com",
    role: "demo",
  };
  if (!(await isAccountSessionActive(user.id, user.role))) {
    return NextResponse.json(
      { error: "The permanent demo account is not initialized." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return response;
}
