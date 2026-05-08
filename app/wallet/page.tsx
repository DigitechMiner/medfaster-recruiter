"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getWalletTransactions,
  WalletTransaction,
} from "@/stores/api/recruiter-wallet-api";
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
  formatCents,
  getFormattedAmount,
  getHoldContextFromIdempotencyKey,
  getTransactionId,
  TabKey,
} from "./helpers";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { TableTabs } from "@/components/table/TableTabs";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All Transactions" },
  { key: "credit", label: "Credit Transactions" },
  { key: "hold", label: "Hold Transactions" },
  { key: "release", label: "Release Transactions" },
  { key: "bonus", label: "Bonus Transactions" },
  { key: "refund", label: "Refund Transactions" },
];

const PER_PAGE_OPTIONS = [10, 20, 50];
const TRANSACTION_HEADERS = [
  "ID",
  "Type",
  "Amount",
  "Status",
  "Created At",
  "Action",
];


// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE: Record<string, string> = {
  green: "bg-green-100  text-green-600",
  blue: "bg-blue-100   text-blue-600",
  orange: "bg-orange-100 text-orange-600",
  gray: "bg-gray-100   text-gray-500",
  red: "bg-red-100    text-red-600",
};

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${BADGE[color] ?? BADGE.gray}`}
    >
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = status?.toUpperCase();
  if (s === "COMPLETED" || s === "SUCCESS")
    return <Pill label="Success" color="green" />;
  if (s === "PENDING") return <Pill label="Pending" color="orange" />;
  if (s === "FAILED") return <Pill label="Failed" color="red" />;
  return <Pill label={status ?? "—"} color="gray" />;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} className="px-4 py-4">
          <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
        </td>
      ))}
    </tr>
  );
}

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
  const [activeCard, setActiveCard] = useState<string>("total");

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
  const { available, locked, pending, total } = useMemo(() => {
    const availableBalance = wallet ? Number(wallet.available_balance) : 0;
    const heldBalance = wallet ? Number(wallet.held_balance) : 0;
    const pendingBalance = wallet ? Number(wallet.pending_balance) : 0;
    return {
      available: availableBalance,
      locked: heldBalance,
      pending: pendingBalance,
      total: availableBalance + heldBalance + pendingBalance,
    };
  }, [wallet]);

  const walletCards = useMemo(
    () =>
      [
        {
          key: "total",
          title: "Wallet Total",
          amount: formatCents(total),
          icon: <Wallet className="w-5 h-5" />,
        },
        {
          key: "available",
          title: "Available",
          amount: formatCents(available),
          icon: <DollarSign className="w-5 h-5" />,
        },
        {
          key: "locked",
          title: "Locked",
          amount: formatCents(locked),
          icon: <Lock className="w-5 h-5" />,
        },
        {
          key: "pending",
          title: "Spent",
          amount: formatCents(pending),
          icon: <TrendingUp className="w-5 h-5" />,
        },
      ] as const,
    [available, locked, pending, total],
  );

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">Loading wallet...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 shadow text-center max-w-sm">
          <p className="font-semibold text-gray-800">Failed to load wallet</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Wallet Overview</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/wallet/topup")}
              className="flex items-center gap-2 px-4 py-2 bg-[#F4781B] text-white text-sm font-semibold rounded-lg hover:bg-[#e06a10] transition-colors"
            >
              <Plus className="w-4 h-4" /> Recharge Wallet
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {walletCards.map((card) => {
            const isActive = activeCard === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setActiveCard(card.key)}
                className={`text-left rounded-xl p-5 flex flex-col gap-3 border-2 transition-all ${
                  isActive
                    ? "bg-orange-50 border-[#F4781B]"
                    : "bg-white border-orange-100 hover:border-[#F4781B]/40"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {card.title}
                  </span>
                  <span
                    className={`p-2 rounded-lg ${isActive ? "bg-orange-200 text-[#F4781B]" : "bg-orange-50 text-[#F4781B]"}`}
                  >
                    {card.icon}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {card.amount}
                </p>
              </button>
            );
          })}
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
    </div>
  );
}
