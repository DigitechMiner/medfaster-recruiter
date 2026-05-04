'use client';

import { useEffect, useState } from 'react';
import { useRouter }           from 'next/navigation';
import {
  getWalletTransactions,
  WalletTransaction,
} from '@/stores/api/recruiter-wallet-api';
import {
  Eye, Filter, Wallet, Lock, DollarSign, TrendingUp,
  ChevronDown, ChevronLeft, ChevronRight, Plus, Download,
} from 'lucide-react';
import { useWalletStore } from '@/stores/walletStore';

type TabKey = 'all' | 'spent' | 'locked' | 'refund';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',    label: 'All Transactions'    },
  { key: 'spent',  label: 'Spent Transactions'  },
  { key: 'locked', label: 'Locked Transactions' },
  { key: 'refund', label: 'Refund Transactions' },
];

const PER_PAGE_OPTIONS = [10, 20, 50];

// ── Formatters ────────────────────────────────────────────────────────────────
function fmtCents(cents: number) {
  return `$${(cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 0 })}`;
}

// Use transaction_id if present, else format from idempotency_key or id
function resolveTxId(tx: WalletTransaction): string {
  if (tx.transaction_id) return tx.transaction_id;
  const raw = (tx.idempotency_key ?? tx.id).replace(/-/g, '').toUpperCase();
  // Format as TXN-YYYYMMDD-NNNNN (take first 8 as date segment, next 5 as serial)
  return `TXN-${raw.slice(0, 8)}-${raw.slice(8, 13)}`;
}

// direction is the reliable field — use it for Credit/Debit display
function resolveDirection(tx: WalletTransaction): { label: string; color: string } {
  const d = tx.direction?.toUpperCase();
  if (d === 'CREDIT')  return { label: 'Credit',  color: 'green'  };
  if (d === 'DEBIT')   return { label: 'Debit',   color: 'orange' };
  if (d === 'HOLD')    return { label: 'Hold',    color: 'blue'   };
  if (d === 'RELEASE') return { label: 'Release', color: 'green'  };
  if (d === 'REFUND')  return { label: 'Refund',  color: 'green'  };
  // Fallback to type
  const t = tx.type?.toUpperCase();
  if (t === 'TOPUP' || t === 'DEPOSIT')            return { label: 'Credit',  color: 'green'  };
  if (t === 'ESCROW_HOLD')                         return { label: 'Debit',   color: 'orange' };
  if (t === 'ESCROW_RELEASE' || t === 'JOB_PAYMENT') return { label: 'Credit', color: 'green' };
  if (t === 'REFUND')                              return { label: 'Refund',  color: 'green'  };
  if (t === 'WITHDRAWAL')                          return { label: 'Debit',   color: 'orange' };
  return { label: tx.type ?? '—', color: 'gray' };
}

// Description: line1 from description or type, line2 from metadata
function resolveDescription(tx: WalletTransaction): { line1: string; line2?: string } {
  const metaDesc = tx.metadata?.description as string | undefined;
  const jobId    = tx.metadata?.job_id       as string | undefined;
  const t        = tx.type?.toUpperCase();

  const line1 =
    tx.description ??
    metaDesc ??
    (t === 'TOPUP'    || t === 'DEPOSIT'                    ? 'Wallet Top-up'              :
     t === 'ESCROW_HOLD'                                    ? 'Funds locked for job shift' :
     t === 'ESCROW_RELEASE' || t === 'JOB_PAYMENT'         ? 'Funds released for job'     :
     t === 'REFUND'                                         ? 'Refund processed'           :
     t === 'WITHDRAWAL'                                     ? 'Withdrawal'                 : '—');

  // line2: show job reference if available
  const line2 = jobId ? `Job ref: ${jobId.slice(0, 8)}…` : undefined;

  return { line1, line2 };
}

// Category derived from type
function resolveCategory(tx: WalletTransaction): { label: string; color: string } {
  const t = tx.type?.toUpperCase();
  if (t === 'TOPUP'    || t === 'DEPOSIT')           return { label: 'Top-up',     color: 'green'  };
  if (t === 'ESCROW_HOLD')                           return { label: 'Job Lock',   color: 'blue'   };
  if (t === 'ESCROW_RELEASE' || t === 'JOB_PAYMENT') return { label: 'Job Payment',color: 'orange' };
  if (t === 'REFUND')                                return { label: 'Refund',     color: 'green'  };
  if (t === 'WITHDRAWAL')                            return { label: 'Withdrawal', color: 'gray'   };
  return { label: tx.type ?? '—', color: 'gray' };
}

// Reference: job_id from metadata, else reference_group_id
function resolveReference(tx: WalletTransaction): string {
  const jobId = tx.metadata?.job_id as string | undefined;
  if (jobId) return `Job Id: ${jobId.slice(0, 8)}`;
  if (tx.reference_group_id) return tx.reference_group_id.slice(0, 12) + '…';
  if (tx.job_payment_id)     return `Pay: ${tx.job_payment_id.slice(0, 8)}`;
  return '—';
}

// Amount formatted — stored as string cents in API
function resolveAmount(tx: WalletTransaction): string {
  if (tx.amount == null) return '—';
  const n = Number(tx.amount);
  if (isNaN(n)) return '—';
  const dollars = n / 100;
  return `$${dollars.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE: Record<string, string> = {
  green:  'bg-green-100  text-green-600',
  blue:   'bg-blue-100   text-blue-600',
  orange: 'bg-orange-100 text-orange-600',
  gray:   'bg-gray-100   text-gray-500',
  red:    'bg-red-100    text-red-600',
};

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${BADGE[color] ?? BADGE.gray}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = status?.toUpperCase();
  if (s === 'COMPLETED' || s === 'SUCCESS') return <Pill label="Success" color="green"  />;
  if (s === 'PENDING')                      return <Pill label="Pending" color="orange" />;
  if (s === 'FAILED')                       return <Pill label="Failed"  color="red"    />;
  return <Pill label={status ?? '—'} color="gray" />;
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

  const wallet        = useWalletStore((s) => s.wallet);
  const walletLoading = useWalletStore((s) => s.isLoading);
  const refreshWallet = useWalletStore((s) => s.refreshWallet);

  const [allTransactions, setAllTransactions] = useState<WalletTransaction[]>([]);
  const [totalItems,      setTotalItems]      = useState(0);
  const [txLoading,       setTxLoading]       = useState(true);
  const [error,           setError]           = useState<string | null>(null);
  const [activeTab,       setActiveTab]       = useState<TabKey>('all');
  const [page,            setPage]            = useState(1);
  const [perPage,         setPerPage]         = useState(10);
  const [period,          setPeriod]          = useState('This Month');
  const [activeCard,      setActiveCard]      = useState<string>('total');

  useEffect(() => { refreshWallet(); }, [refreshWallet]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setTxLoading(true);
        const res = await getWalletTransactions({ page, limit: perPage });
        if (!cancelled) {
          setAllTransactions(res.items ?? []);
          setTotalItems(res.total ?? res.items?.length ?? 0);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setTxLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, perPage]);

  // Client-side tab filter
  const transactions =
    activeTab === 'spent'  ? allTransactions.filter(t => ['ESCROW_RELEASE', 'JOB_PAYMENT', 'WITHDRAWAL'].includes(t.type)) :
    activeTab === 'locked' ? allTransactions.filter(t => t.type === 'ESCROW_HOLD')           :
    activeTab === 'refund' ? allTransactions.filter(t => t.type === 'REFUND')                :
    allTransactions;

  const isLoading   = walletLoading && !wallet;
  const totalPages  = Math.max(1, Math.ceil(totalItems / perPage));
  const showingFrom = totalItems === 0 ? 0 : Math.min((page - 1) * perPage + 1, totalItems);
  const showingTo   = Math.min(page * perPage, totalItems);

  function pageNumbers(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const nums: (number | '...')[] = [1, 2, 3];
    if (page > 4) nums.push('...');
    if (page > 3 && page < totalPages - 2) nums.push(page);
    if (page < totalPages - 3) nums.push('...');
    nums.push(totalPages - 1, totalPages);
    return [...new Set(nums)];
  }

  const available = wallet ? Number(wallet.available_balance) : 0;
  const locked    = wallet ? Number(wallet.held_balance)      : 0;
  const pending   = wallet ? Number(wallet.pending_balance)   : 0;
  const total     = available + locked + pending;

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
      <p className="text-gray-400 text-sm animate-pulse">Loading wallet...</p>
    </div>
  );

  if (error) return (
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
              onClick={() => router.push('/wallet/topup')}
              className="flex items-center gap-2 px-4 py-2 bg-[#F4781B] text-white text-sm font-semibold rounded-lg hover:bg-[#e06a10] transition-colors"
            >
              <Plus className="w-4 h-4" /> Recharge Wallet
            </button>
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none"
              >
                {['This Week', 'This Month', 'Last 3 Months', 'This Year'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {([
            { key: 'total',     title: 'Wallet Total', amount: fmtCents(total),     change: '-0.10%', positive: false, icon: <Wallet     className="w-5 h-5" /> },
            { key: 'available', title: 'Available',    amount: fmtCents(available), change: '+1.10%', positive: true,  icon: <DollarSign className="w-5 h-5" /> },
            { key: 'locked',    title: 'Locked',       amount: fmtCents(locked),    change: '+1.10%', positive: true,  icon: <Lock       className="w-5 h-5" /> },
            { key: 'pending',   title: 'Spent',        amount: fmtCents(pending),   change: '+2.10%', positive: false, icon: <TrendingUp className="w-5 h-5" /> },
          ] as const).map((card) => {
            const isActive = activeCard === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setActiveCard(card.key)}
                className={`text-left rounded-xl p-5 flex flex-col gap-3 border-2 transition-all ${
                  isActive ? 'bg-orange-50 border-[#F4781B]' : 'bg-white border-orange-100 hover:border-[#F4781B]/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-700">{card.title}</span>
                  <span className={`p-2 rounded-lg ${isActive ? 'bg-orange-200 text-[#F4781B]' : 'bg-orange-50 text-[#F4781B]'}`}>
                    {card.icon}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.amount}</p>
                <p className={`text-xs font-medium ${card.positive ? 'text-green-500' : 'text-red-400'}`}>
                  {card.change} {card.positive ? '↑' : '↓'} Since last week
                </p>
              </button>
            );
          })}
        </div>

        {/* ── Transactions Table Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Tabs + Filter */}
          <div className="flex items-center justify-between px-6 border-b border-gray-100">
            <div className="flex">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setPage(1); }}
                  className={`relative px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.key ? 'text-[#F4781B]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F4781B] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[960px]">
              <thead>
                <tr className="bg-orange-50/70 border-b border-orange-100">
                  {[
                    'Transaction ID', 'Date & Time', 'Type', 'Description',
                    'Category', 'Reference', 'Job Type', 'Amount', 'Status', 'Actions',
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={10} />)
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-16 text-center text-gray-400 text-sm">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const txId     = resolveTxId(tx);
                    const dir      = resolveDirection(tx);
                    const desc     = resolveDescription(tx);
                    const cat      = resolveCategory(tx);
                    const ref      = resolveReference(tx);
                    const amount   = resolveAmount(tx);

                    // Job Type — not in API, derive from type
                    const jobType =
                      tx.type === 'ESCROW_HOLD' || tx.type === 'ESCROW_RELEASE' || tx.type === 'JOB_PAYMENT'
                        ? 'Regular'   // default — API doesn't return job_type
                        : null;

                    return (
                      <tr
                        key={tx.id}
                        onClick={() => router.push(`/wallet/transactions/${tx.id}`)}
                        className="border-b border-gray-50 hover:bg-orange-50/40 transition-colors cursor-pointer group"
                      >
                        {/* Transaction ID */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-mono text-[13px] italic text-gray-700">
                            {txId}
                          </span>
                        </td>

                        {/* Date & Time — API doesn't return created_at for transactions */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="text-[13px] text-gray-400 italic text-xs">Not available</p>
                        </td>

                        {/* Type — from direction field */}
                        <td className="px-4 py-4">
                          <Pill label={dir.label} color={dir.color} />
                        </td>

                        {/* Description — two lines */}
                        <td className="px-4 py-4 max-w-[200px]">
                          <p className="text-[13px] text-gray-700 leading-snug">{desc.line1}</p>
                          {desc.line2 && (
                            <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc.line2}</p>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          <Pill label={cat.label} color={cat.color} />
                        </td>

                        {/* Reference — italic */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-[13px] italic text-gray-500">{ref}</span>
                        </td>

                        {/* Job Type — gray pill, N/A for non-job transactions */}
                        <td className="px-4 py-4">
                          {jobType
                            ? <Pill label={jobType} color="gray" />
                            : <span className="text-gray-300 text-xs">—</span>
                          }
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">
                          {amount}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <StatusBadge status={tx.status} />
                        </td>

                        {/* Actions — stop propagation so icon clicks don't double-fire */}
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => router.push(`/wallet/transactions/${tx.id}`)}
                              className="text-[#F4781B] hover:text-orange-600 transition-colors"
                              aria-label="View transaction"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="text-[#F4781B] hover:text-orange-600 transition-colors"
                              aria-label="Download receipt"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 bg-orange-50/60 border-t border-orange-100">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 bg-white rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors font-medium"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-1">
                {pageNumbers().map((p, i) =>
                  p === '...' ? (
                    <span key={`e-${i}`} className="px-2 text-gray-400 text-sm">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(Number(p))}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                        page === p
                          ? 'bg-[#F4781B] text-white shadow-sm'
                          : 'text-gray-600 bg-white border border-gray-200 hover:bg-orange-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 bg-white rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors font-medium"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Showing{' '}
                <span className="font-semibold text-gray-800">{showingFrom}–{showingTo}</span>
                {' '}of{' '}
                <span className="font-semibold text-gray-800">{totalItems}</span>
                {' '}Jobs
              </span>
              <div className="relative">
                <select
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                  className="appearance-none pl-3 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none"
                >
                  {PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n} per page</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}