import { AccountActivity } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

const EVENT_LABELS: Record<AccountActivity["eventType"], string> = {
  account_created: "Account created",
  signed_in: "Signed in",
  account_disabled: "Account disabled",
  account_reactivated: "Account reactivated",
  account_deleted: "Account deleted",
  receipt_created: "Transaction completed",
  receipt_voided: "Transaction voided",
};

export function DashboardActivity({
  activity,
  adminView = false,
}: {
  activity: AccountActivity[];
  adminView?: boolean;
}) {
  if (activity.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-fg">
        Activity will appear here as the account is used.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
      {activity.map((event) => {
        const receiptNumber = event.details.receiptNumber;
        return (
          <li className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between" key={event.id}>
            <div>
              <p className="text-sm font-medium text-fg">
                {EVENT_LABELS[event.eventType]}
                {typeof receiptNumber === "string" && ` · Receipt #${receiptNumber}`}
              </p>
              <p className="text-xs text-muted-fg">
                {adminView && `${event.accountEmail} · `}
                {event.actorEmail !== event.accountEmail &&
                  `by ${event.actorEmail} · `}
                {formatDateTime(event.createdAt)}
              </p>
            </div>
            {typeof event.details.total === "number" && (
              <span className="text-sm font-semibold text-fg">
                {event.details.total.toFixed(2)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
