"use client";

import { useState } from "react";
import Link from "next/link";
import { Receipt } from "@/lib/types";
import { UserDashboardData } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { DashboardActivity } from "./DashboardActivity";
import { SalesTrendChart } from "./SalesTrendChart";

type Tab = "overview" | "trends" | "transactions" | "activity";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "trends", label: "Trends" },
  { id: "transactions", label: "Transactions" },
  { id: "activity", label: "Activity" },
];

export function UserDashboard({
  data,
  currencySymbol,
  ephemeral = false,
}: {
  data: UserDashboardData;
  currencySymbol: string;
  ephemeral?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const formatMoney = (amount: number) => `${currencySymbol}${amount.toFixed(2)}`;

  return (
    <main className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Your workspace
        </p>
        <h1 className="mt-2 text-2xl font-bold text-fg">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-fg">
          Your sales, transactions, and account activity.
        </p>
{ephemeral && (
          <p className="mt-1 text-xs text-muted-fg">
    Signed out — this is your temporary demo workspace. Changes and sales are
    cleared when you reload.
  </p>
)}
      </header>
      <Tabs selected={tab} onSelect={setTab} />

      {tab === "overview" && (
        <section className="space-y-5">
          <StatsGrid
            items={[
              { label: "Sales today", value: formatMoney(data.salesToday) },
              { label: "Sales this month", value: formatMoney(data.salesThisMonth) },
              { label: "Completed transactions", value: String(data.transactionCount) },
              { label: "Average transaction", value: formatMoney(data.averageTransaction) },
            ]}
          />
          <SalesTrendChart
            dailySales={data.dailySales}
            currencySymbol={currencySymbol}
          />
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-fg">Recent transactions</h2>
              <button
                className="text-sm font-semibold text-primary underline"
                onClick={() => setTab("transactions")}
                type="button"
              >
                View all
              </button>
            </div>
            <TransactionTable
              receipts={data.recentReceipts.slice(0, 5)}
              currencySymbol={currencySymbol}
            />
          </section>
        </section>
      )}

      {tab === "trends" && (
        <section className="space-y-5">
          <StatsGrid
            items={[
              { label: "Sales today", value: formatMoney(data.salesToday) },
              { label: "Sales this month", value: formatMoney(data.salesThisMonth) },
              { label: "Average sale", value: formatMoney(data.averageTransaction) },
              { label: "Voided transactions", value: String(data.voidedCount) },
            ]}
          />
          <SalesTrendChart
            dailySales={data.dailySales}
            currencySymbol={currencySymbol}
          />
        </section>
      )}

      {tab === "transactions" && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-fg">Transactions</h2>
              <p className="text-sm text-muted-fg">
                Most recent {data.recentReceipts.length} of up to 50 saved receipts.
              </p>
            </div>
            <Link
              className="text-sm font-semibold text-primary underline"
              href="/receipts"
            >
              Receipt archive
            </Link>
          </div>
          <TransactionTable
            receipts={data.recentReceipts}
            currencySymbol={currencySymbol}
          />
        </section>
      )}

      {tab === "activity" && (
        <section className="space-y-3">
          <div>
            <h2 className="font-semibold text-fg">Account activity</h2>
            <p className="text-sm text-muted-fg">
              Recent sign-ins, transactions, and account events.
            </p>
          </div>
          <DashboardActivity activity={data.activity} />
        </section>
      )}
    </main>
  );
}

function Tabs({
  selected,
  onSelect,
}: {
  selected: Tab;
  onSelect: (tab: Tab) => void;
}) {
  return (
    <nav
      aria-label="Dashboard tabs"
      className="mb-6 flex gap-1 overflow-x-auto border-b border-border"
    >
      {TABS.map((tab) => (
        <button
          aria-current={selected === tab.id ? "page" : undefined}
          className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium ${
            selected === tab.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-fg hover:text-fg"
          }`}
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

function StatsGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div className="rounded-xl border border-border bg-surface p-4" key={item.label}>
          <p className="text-xs font-medium text-muted-fg">{item.label}</p>
          <p className="mt-2 text-xl font-bold text-fg">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function TransactionTable({
  receipts,
  currencySymbol,
}: {
  receipts: Receipt[];
  currencySymbol: string;
}) {
  if (receipts.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-fg">
        Transactions will appear here after your first sale.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-muted text-xs uppercase tracking-wide text-muted-fg">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Receipt</th>
            <th scope="col" className="px-4 py-3 font-medium">Date</th>
            <th scope="col" className="px-4 py-3 font-medium">Items</th>
            <th scope="col" className="px-4 py-3 font-medium">Payment</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {receipts.map((receipt) => (
            <tr key={receipt.id}>
              <td className="px-4 py-3 font-semibold text-fg">
                <Link className="underline" href={`/receipts/${receipt.id}`}>
                  #{receipt.number}
                </Link>
                {receipt.voided && (
                  <span className="ml-2 text-xs font-medium text-red-600">Voided</span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-fg">
                {formatDateTime(receipt.createdAt)}
              </td>
              <td className="px-4 py-3 text-muted-fg">
                {receipt.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}
              </td>
              <td className="px-4 py-3 capitalize text-muted-fg">
                {receipt.paymentMethod}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-fg">
                {currencySymbol}{receipt.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
