"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  LoaderCircle,
  Package,
  Receipt as ReceiptIcon,
  Settings2,
  Store,
  Trash2,
  UserRound,
} from "lucide-react";
import { AdminUserProfile } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/format";
import { DashboardActivity } from "./DashboardActivity";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "./ToastProvider";

const PAYMENT_LABEL = {
  cash: "Cash",
  card: "Card",
  mobile: "Mobile",
} as const;

export function AdminUserProfilePanel({
  accountId,
  onBack,
  onChanged,
  onDeleted,
  onViewReceipts,
}: {
  accountId: string;
  onBack: () => void;
  onChanged: () => void;
  onDeleted: () => void;
  onViewReceipts: (accountId: string) => void;
}) {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<AdminUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchProfile = useCallback(
    async (signal?: AbortSignal): Promise<AdminUserProfile> => {
      const response = await fetch(`/api/admin/accounts/${accountId}`, {
        signal,
        cache: "no-store",
      });
      const result = (await response.json()) as
        | AdminUserProfile
        | { error?: string };
      if (!response.ok || !("account" in result)) {
        throw new Error(
          (result as { error?: string }).error ?? "Could not load the account.",
        );
      }
      return result as AdminUserProfile;
    },
    [accountId],
  );

  const apply = useCallback((next: AdminUserProfile) => {
    setProfile(next);
    setError(null);
    setLoading(false);
  }, []);

  const fail = useCallback((cause: unknown) => {
    setError(cause instanceof Error ? cause.message : "Could not load the account.");
    setLoading(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProfile(controller.signal).then(apply, (cause: unknown) => {
      if (!controller.signal.aborted) fail(cause);
    });
    return () => controller.abort();
  }, [fetchProfile, apply, fail]);

  async function reload() {
    try {
      apply(await fetchProfile());
    } catch (cause) {
      fail(cause);
    }
  }

  async function setStatus(status: "active" | "disabled") {
    setWorking(true);
    try {
      const response = await fetch(`/api/admin/accounts/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? "Could not update the account.");
      }
      showToast(
        status === "active" ? "Account reactivated." : "Account disabled.",
        "success",
      );
      await reload();
      onChanged();
    } catch (cause) {
      showToast(
        cause instanceof Error ? cause.message : "Could not update the account.",
        "error",
      );
    } finally {
      setWorking(false);
    }
  }

  async function destroy() {
    setWorking(true);
    try {
      const response = await fetch(`/api/admin/accounts/${accountId}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? "Could not delete the account.");
      }
      showToast("Account and its workspace deleted.", "success");
      onDeleted();
    } catch (cause) {
      showToast(
        cause instanceof Error ? cause.message : "Could not delete the account.",
        "error",
      );
      setConfirmDelete(false);
    } finally {
      setWorking(false);
    }
  }

  const currency = profile?.settings?.currencySymbol ?? "$";
  const account = profile?.account;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-fg transition-colors hover:text-fg"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          All accounts
        </button>
        {account && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-muted"
              disabled={working}
              onClick={() =>
                void setStatus(
                  account.status === "active" ? "disabled" : "active",
                )
              }
              type="button"
            >
              {account.status === "active" ? (
                <>
                  <Ban aria-hidden="true" size={15} />
                  Disable
                </>
              ) : (
                <>
                  <CheckCircle2 aria-hidden="true" size={15} />
                  Reactivate
                </>
              )}
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
              disabled={working}
              onClick={() => setConfirmDelete(true)}
              type="button"
            >
              <Trash2 aria-hidden="true" size={15} />
              Delete
            </button>
          </div>
        )}
      </div>

      {loading && !profile ? (
        <p
          aria-live="polite"
          className="flex items-center gap-2 text-sm text-muted-fg"
        >
          <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
          Loading account…
        </p>
      ) : error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : profile && account ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-surface p-5">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-primary">
                <UserRound aria-hidden="true" size={20} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-fg">
                  {account.email}
                </h2>
                <p className="mt-0.5 text-sm text-muted-fg">
                  {account.role === "demo"
                    ? "Demo workspace"
                    : account.role === "admin"
                      ? "Administrator"
                      : "Standard account"}{" "}
                  · joined {formatDate(account.createdAt)}
                </p>
                <p className="mt-0.5 text-xs text-muted-fg">
                  Last sign-in{" "}
                  {account.lastLoginAt
                    ? formatDateTime(account.lastLoginAt)
                    : "never"}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                account.status === "active"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-surface-muted text-muted-fg"
              }`}
            >
              {account.status}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Lifetime sales"
              value={`${currency}${profile.stats.salesTotal.toFixed(2)}`}
            />
            <Stat
              label="Transactions"
              value={String(profile.stats.transactionCount)}
            />
            <Stat
              label="Average sale"
              value={`${currency}${profile.stats.averageTransaction.toFixed(2)}`}
            />
            <Stat
              label="Voided"
              value={String(profile.stats.voidedCount)}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel icon={Store} title="Store settings">
              {profile.settings ? (
                <dl className="space-y-2 text-sm">
                  <Row label="Store" value={profile.settings.storeName} />
                  <Row label="Address" value={profile.settings.address} />
                  <Row label="Phone" value={profile.settings.phone} />
                  <Row
                    label="Tax rate"
                    value={`${profile.settings.taxRate}%`}
                  />
                  <Row
                    label="Currency"
                    value={profile.settings.currencySymbol}
                  />
                  <Row
                    label="Next receipt"
                    value={String(profile.settings.nextReceiptNumber)}
                  />
                  <Row
                    label="Products"
                    value={String(profile.stats.productCount)}
                  />
                  <Row
                    label="Last sale"
                    value={
                      profile.stats.lastTransactionAt
                        ? formatDateTime(profile.stats.lastTransactionAt)
                        : "never"
                    }
                  />
                </dl>
              ) : (
                <p className="text-sm text-muted-fg">
                  This account has no store settings yet.
                </p>
              )}
            </Panel>

            <Panel icon={Package} title="Workspace">
              <dl className="space-y-2 text-sm">
                <Row
                  label="Account id"
                  value={<code className="text-xs">{account.id}</code>}
                />
                <Row label="Role" value={account.role} />
                <Row label="Products" value={String(profile.stats.productCount)} />
                <Row
                  label="Receipts kept"
                  value={String(profile.stats.transactionCount + profile.stats.voidedCount)}
                />
                <Row label="Status" value={account.status} />
              </dl>
              <button
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-muted"
                onClick={() => onViewReceipts(account.id)}
                type="button"
              >
                <ReceiptIcon aria-hidden="true" size={15} />
                View all their receipts
              </button>
            </Panel>
          </div>

          <Panel icon={ReceiptIcon} title="Recent receipts">
            {profile.recentReceipts.length === 0 ? (
              <p className="text-sm text-muted-fg">No sales yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-muted text-xs uppercase tracking-wide text-muted-fg">
                    <tr>
                      <th className="px-3 py-2 font-medium" scope="col">
                        Receipt
                      </th>
                      <th className="px-3 py-2 font-medium" scope="col">
                        Date
                      </th>
                      <th className="px-3 py-2 font-medium" scope="col">
                        Items
                      </th>
                      <th className="px-3 py-2 font-medium" scope="col">
                        Paid
                      </th>
                      <th
                        className="px-3 py-2 text-right font-medium"
                        scope="col"
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {profile.recentReceipts.map((receipt) => (
                      <tr
                        className={receipt.voided ? "opacity-60" : undefined}
                        key={receipt.id}
                      >
                        <td className="px-3 py-2 font-medium text-fg">
                          #{receipt.number}
                          {receipt.voided && (
                            <span className="ml-2 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                              Voided
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-muted-fg">
                          {formatDateTime(receipt.createdAt)}
                        </td>
                        <td className="px-3 py-2 text-muted-fg">
                          {receipt.items
                            .map((item) => `${item.name} ×${item.quantity}`)
                            .join(", ")}
                        </td>
                        <td className="px-3 py-2 text-muted-fg">
                          {PAYMENT_LABEL[receipt.paymentMethod]}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums text-fg">
                          {currency}
                          {receipt.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel icon={Settings2} title="Account history">
            <DashboardActivity activity={profile.activity} adminView />
          </Panel>
        </div>
      ) : null}

      {confirmDelete && account && (
        <ConfirmationModal
          confirmLabel="Delete account"
          message={`Delete ${account.email}? Their products, receipts and settings are removed too. This cannot be undone.`}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => void destroy()}
          title="Delete this account?"
        />
      )}
    </section>
  );
}

function Panel({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Store;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg">
        <Icon aria-hidden="true" className="text-muted-fg" size={16} />
        {title}
      </h3>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-medium text-muted-fg">{label}</p>
      <p className="mt-2 text-xl font-bold tabular-nums text-fg">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted-fg">{label}</dt>
      <dd className="min-w-0 break-words text-right text-fg">{value}</dd>
    </div>
  );
}