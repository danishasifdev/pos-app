import { NextRequest, NextResponse } from "next/server";
import { createAccount } from "@/lib/db";
import { createSessionToken, getCurrentUser, hasSessionSecret, SESSION_COOKIE, SESSION_DURATION_SECONDS } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  if (await getCurrentUser()) {
    return NextResponse.json(
      { error: "Sign out before creating another account." },
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
  const { email, password } = body as Record<string, unknown>;
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 256
  ) {
    return NextResponse.json(
      { error: "Enter a valid email and a password at least 12 characters long." },
      { status: 400 },
    );
  }

  try {
    const user = await createAccount(email.trim().toLowerCase(), await hashPassword(password));
    const response = NextResponse.json({ ok: true, role: user.role }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "ACCOUNT_LIMIT_REACHED") {
      return NextResponse.json(
        { error: "The account limit has been reached. Contact the administrator." },
        { status: 409 },
      );
    }
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }
    throw error;
  }
}
