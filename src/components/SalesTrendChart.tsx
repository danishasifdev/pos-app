import { DailySales } from "@/lib/types";
import { formatDayLabel } from "@/lib/format";

export function SalesTrendChart({
  dailySales,
  currencySymbol,
  metric = "sales",
}: {
  dailySales: DailySales[];
  currencySymbol: string;
  metric?: "sales" | "transactions";
}) {
  const valueFor = (day: DailySales) =>
    metric === "sales" ? day.total : day.transactionCount;
  const maximum = Math.max(1, ...dailySales.map(valueFor));

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-5">
        <h2 className="font-semibold text-fg">
          {metric === "sales" ? "Sales trend" : "Transaction trend"}
        </h2>
        <p className="text-sm text-muted-fg">Daily totals for the last 14 days</p>
      </div>
      <div
        aria-label="Daily sales for the last 14 days"
        className="grid h-44 grid-cols-[repeat(14,minmax(0,1fr))] items-end gap-1 sm:gap-2"
        role="img"
      >
        {dailySales.map((day) => {
          const value = valueFor(day);
          const height = value === 0 ? 2 : Math.max(6, (value / maximum) * 100);
          const label = formatDayLabel(day.day);
          return (
            <div
              className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
              key={day.day}
              title={
                metric === "sales"
                  ? `${label}: ${currencySymbol}${day.total.toFixed(2)} · ${day.transactionCount} transactions`
                  : `${label}: ${day.transactionCount} transactions`
              }
            >
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-t bg-primary"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[9px] text-muted-fg sm:text-[10px]">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
