import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, getCurrentUser, hasSessionSecret, SESSION_COOKIE, SESSION_DURATION_SECONDS } from "@/lib/auth";
import { getLoginRecord, recordSuccessfulLogin, setAccountStatus } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  if (await getCurrentUser()) {
    return NextResponse.json(
      { error: "Sign out before switching accounts." },
      { status: 409 },
    );
  }
  if (!hasSessionSecret()) {
    return NextResponse.json(
      { error: "APP_SESSION_SECRET must be configured before accounts can sign in." },
      { status: 503 },
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { email, password, expectedRole } = body as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const record = await getLoginRecord(email.trim().toLowerCase());
  if (
    !record ||
    !(await verifyPassword(password, record.passwordHash)) ||
    (expectedRole !== undefined && expectedRole !== record.user.role)
  ) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 },
    );
  }
  if (record.user.status !== "active") {
    await setAccountStatus(record.user.id, "disabled", {
      id: "system",
      email: "System",
    });
    return NextResponse.json(
      { error: "This account is inactive. Contact the administrator." },
      { status: 403 },
    );
  }

  await recordSuccessfulLogin(record.user.id);
  const response = NextResponse.json({ ok: true, role: record.user.role });
  response.cookies.set(SESSION_COOKIE, createSessionToken(record.user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return response;
}
