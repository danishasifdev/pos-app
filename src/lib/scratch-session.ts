import { headers } from "next/headers";
import type { SessionUser } from "./auth";
import { resetEphemeral } from "./workspace";

/**
 * Wipe the throwaway workspace at the start of a full anonymous page load.
 *
 * This must run from the page itself rather than the layout: Next renders
 * layout and page segments concurrently, so a layout-side reset races the
 * page's read and leaves the browser holding product ids that no longer exist.
 * Doing it here keeps "wipe, then read" sequential.
 *
 * The proxy forwards `x-pos-request` because Next does not expose its own
 * routing headers through headers(); "document" means a hard load (so the data
 * is gone on refresh) while an in-app navigation keeps it.
 */
export async function resetScratchOnDocumentLoad(
  user: SessionUser | null,
): Promise<void> {
  if (user) return;
  if ((await headers()).get("x-pos-request") === "document") {
    await resetEphemeral();
  }
}