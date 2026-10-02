import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const schemaReady = await checkDatabaseConnection();
    if (!schemaReady) {
      return NextResponse.json(
        {
          status: "error",
          database: "connected",
          schema: "missing",
          message:
            "Connected to Postgres, but account or activity tables are missing. Run migrations 0002_user_accounts.sql and 0004_account_activity.sql in this Supabase project.",
        },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json({
      status: "ok",
      database: "connected",
      schema: "ready",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message:
          "Could not query Postgres. Check the server DATABASE_URL and database availability.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
