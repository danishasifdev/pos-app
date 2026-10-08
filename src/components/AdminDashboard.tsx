"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import {
  AccountActivity,
  AdminDashboardData,
  AdminTransaction,
} from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/format";
import { AdminUserProfilePanel } from "./AdminUserProfile";
import { DashboardActivity } from "./DashboardActivity";
import { SalesTrendChart } from "./SalesTrendChart";
import { useToast } from "./ToastProvider";

type Tab = "overview" | "users" | "profile" | "transactions" | "activity";
type AccountFilter = "all" | "active" | "disabled" | "demo";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "profile", label: "User profile" },
  { id: "transactions", label: "Transactions" },
  { id: "activity", label: "Activity history" },
];
const ACCOUNT_FILTERS: { id: AccountFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "disabled", label: "Disabled" },
  { id: "demo", label: "Demo" },
];

export function AdminDashboard({
  initialData,
  viewerEmail,
}: {
  initialData: AdminDashboardData;
  viewerEmail: string;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  // When set, the Transactions tab is narrowed to this account.
  const [transactionAccountId, setTransactionAccountId] = useState<
    string | null
  >(null);
  const [selectedActivity, setSelectedActivity] = useState<{
    accountId: string;
    events: AccountActivity[];
    error?: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState<AccountFilter>("all");
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [transactionResults, setTransactionResults] = useState<
    Record<string, { transactions: AdminTransaction[]; error?: string }>
  >({});
  const accountCounts = useMemo(
    () => ({
      all: data.accounts.length,
      active: data.accounts.filter(
        (account) => account.role === "user" && account.status === "active",
      ).length,
      disabled: data.accounts.filter(
        (account) => account.role === "user" && account.status === "disabled",
      ).length,
      demo: data.accounts.filter((account) => account.role === "demo").length,
    }),
    [data.accounts],
  );
  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.accounts.filter(
      (account) =>
        (accountFilter === "all" ||
          (accountFilter === "demo"
            ? account.role === "demo"
            : account.role === "user" && account.status === accountFilter)) &&
        (!query || account.email.toLowerCase().includes(query)),
    );
  }, [accountFilter, data.accounts, search]);
  const selectedAccount = filteredAccounts.find(
    (account) => account.id === selectedAccountId,
  );
  const transactionScope =
    tab === "transactions"
      ? (transactionAccountId ?? "all")
      : tab === "users" && selectedAccount
        ? selectedAccount.id
        : null;
  const accountTransactions = selectedAccount
    ? (transactionResults[selectedAccount.id]?.transactions ?? [])
    : [];
  const accountActivity =
    selectedAccount && selectedActivity?.accountId === selectedAccount.id
      ? selectedActivity
      : null;

  useEffect(() => {
    if (!selectedAccountId) return;
    const controller = new AbortController();
    void fetch(`/api/admin/accounts/${selectedAccountId}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json()) as {
          activity?: AccountActivity[];
          error?: string;
        };
        if (!response.ok || !result.activity) {
          throw new Error(result.error ?? "Could not load account history.");
        }
        setSelectedActivity({
          accountId: selectedAccountId,
          events: result.activity,
        });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          const message =
            error instanceof Error
              ? error.message
              : "Could not load account history.";
          setSelectedActivity({
            accountId: selectedAccountId,
            events: [],
            error: message,
          });
          showToast(message, "error");
        }
      });
    return () => controller.abort();
  }, [selectedAccountId, showToast]);

  useEffect(() => {
    if (!transactionScope || transactionResults[transactionScope]) return;
    const controller = new AbortController();
    const query =
      transactionScope === "all"
        ? ""
        : `?accountId=${encodeURIComponent(transactionScope)}`;
    void fetch(`/api/admin/transactions${query}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json()) as {
          transactions?: AdminTransaction[];
          error?: string;
        };
        const transactions = result.transactions;
        if (!response.ok || !transactions) {
          throw new Error(result.error ?? "Could not load transactions.");
        }
        setTransactionResults((current) => ({
          ...current,
          [transactionScope]: { transactions },
        }));
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error
            ? error.message
            : "Could not load transactions.";
        setTransactionResults((current) => ({
          ...current,
          [transactionScope]: { transactions: [], error: message },
        }));
      });
    return () => controller.abort();
  }, [transactionResults, transactionScope]);

  async function changeStatus(
    accountId: string,
    status: "active" | "disabled",
  ) {
    setWorkingId(accountId);
    try {
      const response = await fetch(`/api/admin/accounts/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = (await response.json()) as {
        account?: AdminDashboardData["accounts"][number];
        error?: string;
      };
      if (!response.ok || !result.account) {
        showToast(result.error ?? "Could not update account.", "error");
        return;
      }
      const updatedAccount = result.account;
      setData((current) => ({
        ...current,
        activeAccounts:
          current.activeAccounts +
          (updatedAccount.status === "active" ? 1 : -1),
        accounts: current.accounts.map((entry) =>
          entry.id === accountId ? { ...entry, ...updatedAccount } : entry,
        ),
        activity: [
          {
            id: window.crypto.randomUUID(),
            accountId,
            accountEmail: updatedAccount.email,
            actorEmail: viewerEmail,
            eventType:
              status === "active" ? "account_reactivated" : "account_disabled",
            details: {},
            createdAt: new Date().toISOString(),
          },
          ...current.activity,
        ],
      }));
      showToast(
        `${result.account.email} ${status === "active" ? "reactivated" : "disabled"}.`,
        "success",
      );
    } catch {
      showToast("Could not reach the server.", "error");
    } finally {
      setWorkingId(null);
    }
  }

  async function deleteAccount(accountId: string, email: string) {
    if (
      !window.confirm(
        `Permanently delete ${email} and all their POS data? This cannot be undone.`,
      )
    ) {
      return;
    }
    setWorkingId(accountId);
    try {
      const response = await fetch(`/api/admin/accounts/${accountId}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        showToast(result.error ?? "Could not delete account.", "error");
        return;
      }
      const removedAccount = data.accounts.find(
        (account) => account.id === accountId,
      );
      const deletedEvent: AccountActivity = {
        id: window.crypto.randomUUID(),
        accountId,
        accountEmail: email,
        actorEmail: viewerEmail,
        eventType: "account_deleted",
        details: {},
        createdAt: new Date().toISOString(),
      };
      setData((current) => ({
        ...current,
        activeAccounts:
          current.activeAccounts -
          (removedAccount?.status === "active" ? 1 : 0),
        transactionCount: Math.max(
          0,
          current.transactionCount - (removedAccount?.transactionCount ?? 0),
        ),
        salesByCurrency: current.salesByCurrency
          .map((sales) =>
            sales.currencySymbol === removedAccount?.currencySymbol
              ? {
                  ...sales,
                  total: Math.max(
                    0,
                    sales.total - (removedAccount?.salesTotal ?? 0),
                  ),
                }
              : sales,
          )
          .filter((sales) => sales.total > 0),
        accounts: current.accounts.filter(
          (account) => account.id !== accountId,
        ),
        activity: [deletedEvent, ...current.activity],
      }));
      setTransactionResults((current) =>
        Object.fromEntries(
          Object.entries(current).map(([scope, result]) => [
            scope,
            {
              ...result,
              transactions: result.transactions.filter(
                (transaction) => transaction.accountId !== accountId,
              ),
            },
          ]),
        ),
      );
      if (selectedAccountId === accountId) setSelectedAccountId(null);
      showToast(`${email} and its POS data were deleted.`, "success");
    } catch {
      showToast("Could not reach the server.", "error");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Administration
        </p>
        <h1 className="mt-2 text-2xl font-bold text-fg">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-fg">
          Workspaces, transaction activity, and account history.
        </p>
      </header>
      <nav
        aria-label="Admin dashboard tabs"
        className="mb-6 flex gap-1 overflow-x-auto border-b border-border"
      >
        {TABS.map((item) => (
          <button
            aria-current={tab === item.id ? "page" : undefined}
            className={`whitespace-nowrap border-b-2 cursor-pointer px-4 py-2.5 text-sm font-medium ${
              tab === item.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-fg hover:text-fg"
            }`}
            key={item.id}
            onClick={() => setTab(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Stat
              label="Active workspaces"
              value={String(data.activeAccounts)}
            />
            <Stat label="Users + demo" value={String(data.accounts.length)} />
            <Stat
              label="Completed transactions"
              value={String(data.transactionCount)}
            />
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-medium text-muted-fg">
                Sales by currency
              </p>
              <div className="mt-2 space-y-1">
                {data.salesByCurrency.length === 0 ? (
                  <p className="text-xl font-bold text-fg">-</p>
                ) : (
                  data.salesByCurrency.map((sales) => (
                    <p
                      className="text-lg font-bold text-fg"
                      key={sales.currencySymbol}
                    >
                      {sales.currencySymbol}
                      {sales.total.toFixed(2)}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
          <SalesTrendChart
            dailySales={data.dailySales}
            currencySymbol=""
            metric="transactions"
          />
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-fg">Workspaces</h2>
              <button
                className="text-sm font-semibold text-primary underline"
                onClick={() => setTab("users")}
                type="button"
              >
                View all
              </button>
            </div>
            <AccountTable
              accounts={data.accounts.slice(0, 5)}
              selectedId={selectedAccountId}
              onSelect={(id) => {
                setSelectedAccountId(id);
                setTab("users");
              }}
            />
          </section>
          <section>
            <h2 className="mb-3 font-semibold text-fg">Recent activity</h2>
            <DashboardActivity activity={data.activity.slice(0, 8)} adminView />
          </section>
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-5">
          <section>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-fg">All workspaces</h2>
                <p className="text-sm text-muted-fg">
                  Select a workspace to see its transactions and activity
                  history.
                </p>
              </div>
              <input
                aria-label="Search workspaces"
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by email"
                value={search}
              />
            </div>
            <nav
              aria-label="Filter users"
              className="mb-3 flex flex-wrap gap-2"
            >
              {ACCOUNT_FILTERS.map((filter) => (
                <button
                  aria-pressed={accountFilter === filter.id}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    accountFilter === filter.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-muted-fg hover:text-fg"
                  }`}
                  key={filter.id}
                  onClick={() => setAccountFilter(filter.id)}
                  type="button"
                >
                  {filter.label} ({accountCounts[filter.id]})
                </button>
              ))}
            </nav>
            <AccountTable
              accounts={filteredAccounts}
              selectedId={selectedAccountId}
              onSelect={(id) => {
                setSelectedAccountId(id);
                setTab("profile");
              }}
              onToggleStatus={(account) =>
                void changeStatus(
                  account.id,
                  account.status === "active" ? "disabled" : "active",
                )
              }
              onDelete={(account) =>
                void deleteAccount(account.id, account.email)
              }
              workingId={workingId}
            />
          </section>
          {selectedAccount && (
            <section className="space-y-4 rounded-xl border border-border bg-surface p-4 md:p-5">
              <div>
                <h2 className="text-lg font-semibold text-fg">
                  {selectedAccount.email}
                </h2>
                <p className="text-sm text-muted-fg">
                  Created {formatDateTime(selectedAccount.createdAt)} · Last
                  sign-in{" "}
                  {selectedAccount.lastLoginAt
                    ? formatDateTime(selectedAccount.lastLoginAt)
                    : "never"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat
                  label="Sales"
                  value={`${selectedAccount.currencySymbol}${selectedAccount.salesTotal.toFixed(2)}`}
                />
                <Stat
                  label="Transactions"
                  value={String(selectedAccount.transactionCount)}
                />
                <Stat
                  label="Voided"
                  value={String(selectedAccount.voidedCount)}
                />
                <Stat label="Status" value={selectedAccount.status} />
              </div>
              <SalesTrendChart
                dailySales={selectedAccount.dailySales}
                currencySymbol={selectedAccount.currencySymbol}
              />
              <div>
                <h3 className="mb-3 font-semibold text-fg">Transactions</h3>
                {!transactionResults[selectedAccount.id] ? (
                  <p
                    aria-live="polite"
                    className="flex items-center gap-2 text-sm text-muted-fg"
                  >
                    <LoaderCircle
                      aria-hidden="true"
                      className="animate-spin"
                      size={16}
                    />
                    Loading transactions…
                  </p>
                ) : transactionResults[selectedAccount.id].error ? (
                  <p className="text-sm text-red-700">
                    {transactionResults[selectedAccount.id].error}
                  </p>
                ) : (
                  <AdminTransactionTable
                    transactions={accountTransactions}
                    emptyMessage="This workspace has no transactions."
                  />
                )}
              </div>
              <div>
                <h3 className="mb-3 font-semibold text-fg">History</h3>
                {!accountActivity ? (
                  <p
                    aria-live="polite"
                    className="flex items-center gap-2 text-sm text-muted-fg"
                  >
                    <LoaderCircle
                      aria-hidden="true"
                      className="animate-spin"
                      size={16}
                    />
                    Loading account history…
                  </p>
                ) : accountActivity.error ? (
                  <p className="text-sm text-red-700">
                    {accountActivity.error}
                  </p>
                ) : (
                  <DashboardActivity
                    activity={accountActivity.events}
                    adminView
                  />
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {tab === "profile" && selectedAccountId && (
        <AdminUserProfilePanel
          accountId={selectedAccountId}
          onBack={() => setTab("users")}
          onChanged={() => router.refresh()}
          onDeleted={() => {
            setSelectedAccountId(null);
            setTab("users");
            router.refresh();
          }}
          onViewReceipts={(id) => {
            setSelectedAccountId(id);
            setTransactionAccountId(id);
            setTab("transactions");
          }}
        />
      )}

      {tab === "profile" && !selectedAccountId && (
        <section className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-fg">No account selected</p>
          <p className="mt-1 text-sm text-muted-fg">
            Pick an account from the Users tab to see its profile, receipts and
            history.
          </p>
          <button
            className="mt-4 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-muted"
            onClick={() => setTab("users")}
            type="button"
          >
            Go to Users
          </button>
        </section>
      )}

      {tab === "transactions" && (
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-fg">
                {transactionAccountId
                  ? `Receipts for ${
                      data.accounts.find((a) => a.id === transactionAccountId)
                        ?.email ?? "this account"
                    }`
                  : "All transactions"}
              </h2>
              <p className="text-sm text-muted-fg">
                Includes voided receipts; sales totals exclude voided
                transactions. Showing the most recent 200.
              </p>
            </div>
            {transactionAccountId && (
              <button
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-muted"
                onClick={() => setTransactionAccountId(null)}
                type="button"
              >
                Show all workspaces
              </button>
            )}
          </div>
          {!transactionResults[transactionScope ?? "all"] ? (
            <p
              aria-live="polite"
              className="flex items-center gap-2 text-sm text-muted-fg"
            >
              <LoaderCircle
                aria-hidden="true"
                className="animate-spin"
                size={16}
              />
              Loading transactions…
            </p>
          ) : transactionResults[transactionScope ?? "all"].error ? (
            <p className="text-sm text-red-700">
              {transactionResults[transactionScope ?? "all"].error}
            </p>
          ) : (
            <AdminTransactionTable
              transactions={
                transactionResults[transactionScope ?? "all"].transactions
              }
            />
          )}
        </section>
      )}

      {tab === "activity" && (
        <section>
          <div className="mb-3">
            <h2 className="font-semibold text-fg">Account history</h2>
            <p className="text-sm text-muted-fg">
              Account creation, successful sign-ins, account status changes, and
              transactions.
            </p>
          </div>
          <DashboardActivity activity={data.activity} adminView />
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-medium capitalize text-muted-fg">{label}</p>
      <p className="mt-2 text-xl font-bold capitalize text-fg">{value}</p>
    </div>
  );
}

function AccountTable({
  accounts,
  selectedId,
  onSelect,
  onToggleStatus,
  onDelete,
  workingId,
}: {
  accounts: AdminDashboardData["accounts"];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleStatus?: (account: AdminDashboardData["accounts"][number]) => void;
  onDelete?: (account: AdminDashboardData["accounts"][number]) => void;
  workingId?: string | null;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-muted text-xs uppercase tracking-wide text-muted-fg">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Account
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Last sign-in
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Transactions
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Sales
            </th>
            {onToggleStatus && (
              <th scope="col" className="px-4 py-3 font-medium">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {accounts.map((account) => (
            <tr
              className={`cursor-pointer transition-colors hover:bg-surface-muted ${
                selectedId === account.id ? "bg-accent-soft" : ""
              }`}
              key={account.id}
              onClick={() => onSelect(account.id)}
            >
              <td className="px-4 py-3">
                <button
                  aria-label={`Open profile for ${account.email}`}
                  className="text-left font-semibold text-primary"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(account.id);
                  }}
                  type="button"
                >
                  {account.email}
                </button>
                {account.role === "demo" && (
                  <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-muted-fg">
                    Demo
                  </span>
                )}
              </td>
              <td className="px-4 py-3 capitalize text-muted-fg">
                {account.status}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-fg">
                {account.lastLoginAt
                  ? formatDate(account.lastLoginAt)
                  : "Never"}
              </td>
              <td className="px-4 py-3 text-right text-fg">
                {account.transactionCount}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-fg">
                {account.currencySymbol}
                {account.salesTotal.toFixed(2)}
              </td>
              {onToggleStatus && onDelete && (
                <td className="space-x-3 whitespace-nowrap px-4 py-3">
                  {account.role === "user" ? (
                    <>
                      <button
                        aria-busy={workingId === account.id}
                        className="inline-flex items-center gap-1 font-semibold text-primary underline disabled:opacity-50"
                        disabled={workingId === account.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          onToggleStatus(account);
                        }}
                        type="button"
                      >
                        {workingId === account.id && (
                          <LoaderCircle
                            aria-hidden="true"
                            className="animate-spin"
                            size={14}
                          />
                        )}
                        {workingId === account.id
                          ? "Saving…"
                          : account.status === "active"
                            ? "Disable"
                            : "Reactivate"}
                      </button>
                      <button
                        aria-busy={workingId === account.id}
                        className="inline-flex items-center gap-1 font-semibold text-red-700 underline disabled:opacity-50"
                        disabled={workingId === account.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(account);
                        }}
                        type="button"
                      >
                        {workingId === account.id && (
                          <LoaderCircle
                            aria-hidden="true"
                            className="animate-spin"
                            size={14}
                          />
                        )}
                        Delete
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-fg">
                      Permanent demo
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
          {accounts.length === 0 && (
            <tr>
              <td
                className="px-4 py-8 text-center text-muted-fg"
                colSpan={onToggleStatus ? 6 : 5}
              >
                No workspaces found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AdminTransactionTable({
  transactions,
  emptyMessage = "There are no transactions yet.",
}: {
  transactions: AdminTransaction[];
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-muted text-xs uppercase tracking-wide text-muted-fg">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Receipt
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Workspace
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Date
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Items
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Payment
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="whitespace-nowrap px-4 py-3 font-semibold text-fg">
                #{transaction.number}
                {transaction.voided && (
                  <span className="ml-2 text-xs font-medium text-red-600">
                    Voided
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-fg">
                {transaction.accountEmail}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-fg">
                {formatDateTime(transaction.createdAt)}
              </td>
              <td className="px-4 py-3 text-muted-fg">
                {transaction.items
                  .map((item) => `${item.name} × ${item.quantity}`)
                  .join(", ")}
              </td>
              <td className="px-4 py-3 capitalize text-muted-fg">
                {transaction.paymentMethod}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-fg">
                {transaction.currencySymbol}
                {transaction.total.toFixed(2)}
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-muted-fg" colSpan={6}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
