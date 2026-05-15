"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getWalletTransactions,
  WalletTransaction,
} from "@/features/wallet";
import {
  Eye,
  Wallet,
  Lock,
  DollarSign,
  TrendingUp,
  Plus,
} from "lucide-react";
import { useWalletStore } from "@/stores/walletStore";
import {
  PER_PAGE_OPTIONS,
  Pill,
  SkeletonRow,
  StatusBadge,
  TABS,
  TRANSACTION_HEADERS,
  formatCents,
  getFormattedAmount,
  getHoldContextFromIdempotencyKey,
  getTransactionId,
  TabKey,
} from "./helpers";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { TableTabs } from "@/components/table/TableTabs";
import { MetricCard } from "@/components/ui/metric-card";
import { AppLayout } from "@/components/global/app-layout";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function WalletPage() {
  const router = useRouter();

  const wallet = useWalletStore((s) => s.wallet);
  const walletLoading = useWalletStore((s) => s.isLoading);
  const refreshWallet = useWalletStore((s) => s.refreshWallet);

  const [allTransactions, setAllTransactions] = useState<WalletTransaction[]>(
    [],
  );
  const [totalItems, setTotalItems] = useState(0);
  const [txLoading, setTxLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setTxLoading(true);
        const type = activeTab === "all" ? undefined : activeTab;
        const res = await getWalletTransactions({ page, limit: perPage, type });
        if (!cancelled) {
          setAllTransactions(res.items ?? []);
          setTotalItems(res.total ?? res.items?.length ?? 0);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setTxLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab, page, perPage]);

  const isLoading = walletLoading && !wallet;
  const { available, locked, total, monthlySpendTotal } = useMemo(() => {
    const availableBalance = wallet ? Number(wallet.available_balance) : 0;
    const heldBalance = wallet ? Number(wallet.held_balance) : 0;
    const pendingBalance = wallet ? Number(wallet.pending_balance) : 0;
    const jobSpend = wallet ? Number(wallet.monthly_job_spend_cents) : NaN;
    const interviewSpend = wallet
      ? Number(wallet.monthly_interview_spend_cents)
      : NaN;
    const job = Number.isFinite(jobSpend) ? jobSpend : 0;
    const interview = Number.isFinite(interviewSpend) ? interviewSpend : 0;
    return {
      available: availableBalance,
      locked: heldBalance,
      total: availableBalance + heldBalance + pendingBalance,
      monthlySpendTotal: job + interview,
    };
  }, [wallet]);

  if (isLoading)
    return (
      <AppLayout padding="none">
        <div className="flex flex-col p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full min-h-[50vh] items-center justify-center">
          <p className="text-gray-400 text-sm animate-pulse">Loading wallet...</p>
        </div>
      </AppLayout>
    );

  if (error)
    return (
      <AppLayout padding="none">
        <div className="flex flex-col p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full min-h-[50vh] items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow text-center max-w-sm">
            <p className="font-semibold text-gray-800">Failed to load wallet</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </AppLayout>
    );

  return (
    <AppLayout padding="none">
      <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full max-w-7xl">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold leading-8 text-gray-900">Wallet Overview</h1>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/wallet/topup")}
              className="inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded-lg bg-[#F4781B] text-white text-sm font-semibold hover:bg-[#e06a10] transition-colors"
            >
              <Plus className="size-4" aria-hidden />
              Recharge Wallet
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            icon={<Wallet className="w-5 h-5" />}
            title="Wallet Total"
            value={formatCents(total)}
          />
          <MetricCard
            icon={<DollarSign className="w-5 h-5" />}
            title="Available"
            value={formatCents(available)}
          />
          <MetricCard
            icon={<Lock className="w-5 h-5" />}
            title="Locked"
            value={formatCents(locked)}
          />
          <MetricCard
            icon={<TrendingUp className="w-5 h-5" />}
            title={
              wallet?.monthly_spend_month
                ? `Monthly spend (${wallet.monthly_spend_month})`
                : "Monthly spend"
            }
            value={formatCents(monthlySpendTotal)}
          />
        </div>

        {/* ── Transactions Table Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs + Filter */}
          <div className="flex items-center justify-between px-6 border-b border-gray-100">
            <TableTabs
              tabs={TABS}
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setPage(1);
              }}
              tabClassName="relative px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap"
            />
          </div>

          {/* Table */}
          <DataTable headers={TRANSACTION_HEADERS}>
            {txLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={6} />
              ))
            ) : allTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-16 text-center text-gray-400 text-sm"
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              allTransactions.map((tx) => {
                const txId = getTransactionId(tx);
                const amount = getFormattedAmount(tx);
                const holdContext = getHoldContextFromIdempotencyKey(
                  tx.idempotency_key,
                );
                const createdAt = tx.created_at
                  ? new Date(tx.created_at).toLocaleString("en-CA")
                  : "—";

                return (
                  <tr
                    key={tx.id}
                    onClick={() =>
                      router.push(`/wallet/transactions/${tx.id}`)
                    }
                    className="border-b border-gray-50 hover:bg-orange-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-mono text-[13px] italic text-gray-700">
                        {txId}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {holdContext ? (
                        <div className="space-y-1">
                          <Pill label={holdContext.label} color="blue" />
                          {holdContext.referenceId && (
                            <p className="text-[11px] font-mono text-gray-500 break-all">
                              {holdContext.referenceId}
                            </p>
                          )}
                        </div>
                      ) : (
                        <Pill label={tx.type ?? "—"} color="gray" />
                      )}
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">
                      {amount}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[13px] text-gray-700">
                      {createdAt}
                    </td>
                    <td
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            router.push(`/wallet/transactions/${tx.id}`)
                          }
                          className="text-[#F4781B] hover:text-orange-600 transition-colors"
                          aria-label="View transaction"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </DataTable>

          {/* Pagination */}
          <PaginationFooter
            page={page}
            totalItems={totalItems}
            perPage={perPage}
            onPageChange={setPage}
            itemLabel="transactions"
            perPageOptions={PER_PAGE_OPTIONS}
            onPerPageChange={(nextPerPage) => {
              setPerPage(nextPerPage);
              setPage(1);
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
}
