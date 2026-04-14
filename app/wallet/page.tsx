'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getWallet,
  getWalletTransactions,
  WalletData,
  WalletTransaction,
} from '@/stores/api/recruiter-wallet-api';
import { Navbar } from '@/components/global/navbar';
import { Eye, Filter, Wallet, Lock, DollarSign, TrendingUp, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

// ── Tab types ─────────────────────────────────────────────────────────────────
type TabKey = 'all' | 'spent' | 'locked' | 'refund';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',    label: 'All Transactions'    },
  { key: 'spent',  label: 'Spent Transactions'  },
  { key: 'locked', label: 'Locked Transactions' },
  { key: 'refund', label: 'Refund Transactions' },
];

const PER_PAGE_OPTIONS = [10, 20, 50];

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  const map: Record<string, string> = {
    green:  'bg-green-100 text-green-700',
    blue:   'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
    gray:   'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[color] ?? map.gray}`}>
      {label}
    </span>
  );
}

// ── Type badge colors ─────────────────────────────────────────────────────────
function typeBadge(type: string) {
  if (!type) return <Badge label="—" color="gray" />;
  const t = type.toLowerCase();
  if (t === 'credit') return <Badge label="Credit" color="green" />;
  if (t === 'debit')  return <Badge label="Debit"  color="orange" />;
  return <Badge label={type} color="gray" />;
}
function categoryBadge(cat: string) {
  if (!cat) return null;
  return <Badge label={cat.replace(/_/g, ' ')} color="blue" />;
}
function jobTypeBadge(jt: string) {
  if (!jt) return null;
  return <Badge label={jt} color="orange" />;
}
function statusBadge(status: string | undefined) {
  const s = status?.toLowerCase();
  if (s === 'success' || s === 'completed') return <Badge label="Success" color="green" />;
  if (s === 'pending') return <Badge label="Pending" color="orange" />;
  if (s === 'failed')  return <Badge label="Failed"  color="gray"   />;
  return <Badge label={status ?? '—'} color="gray" />;
}

// ── Format currency ───────────────────────────────────────────────────────────
function fmt(cents: number) {
  return `$ ${(cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 0 })}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function WalletPage() {
  const router = useRouter();

  const [wallet, setWallet]           = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [totalItems, setTotalItems]   = useState(0);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const [activeTab, setActiveTab]     = useState<TabKey>('all');
  const [page, setPage]               = useState(1);
  const [perPage, setPerPage]         = useState(10);
  const [period, setPeriod]           = useState('This Month');
  const [activeCard, setActiveCard] = useState<string>('total');

  // ── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const typeFilter = activeTab === 'all' ? undefined
          : activeTab === 'spent'  ? 'debit'
          : activeTab === 'locked' ? 'locked'
          : 'refund';

        const [walletData, txData] = await Promise.all([
          getWallet(),
          getWalletTransactions({ page, limit: perPage, type: typeFilter }),
        ]);
        setWallet(walletData);
        setTransactions(txData.items);
        setTotalItems(txData.total ?? txData.items.length);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load wallet');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [activeTab, page, perPage]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages    = Math.max(1, Math.ceil(totalItems / perPage));
  const showingFrom   = Math.min((page - 1) * perPage + 1, totalItems);
  const showingTo     = Math.min(page * perPage, totalItems);

  function pageNumbers(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1, 2, 3];
    if (page > 4) pages.push('...');
    if (page > 3 && page < totalPages - 2) pages.push(page);
    if (page < totalPages - 3) pages.push('...');
    pages.push(totalPages - 1, totalPages);
    return [...new Set(pages)];
  }

  // ── Stat values ───────────────────────────────────────────────────────────
 const available = wallet ? Number(wallet.available_balance) : 0;
const locked    = wallet ? Number(wallet.held_balance)      : 0;  // ✅ held_balance = locked
const pending   = wallet ? Number(wallet.pending_balance)   : 0;
const total     = available + locked + pending;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading && !wallet) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-56px)] bg-[#f8f7f5] flex items-center justify-center">
          <p className="text-gray-400 text-sm animate-pulse">Loading wallet...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-56px)] bg-[#f8f7f5] flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow text-center max-w-sm">
            <p className="font-semibold text-gray-800">Failed to load wallet</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-56px)] bg-[#f8f7f5] overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6 bg-white rounded-xl mt-4">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Wallet Overview</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/wallet/topup')}
                className="flex items-center gap-2 px-4 py-2 bg-[#f47b20] text-white text-sm font-semibold rounded-lg hover:bg-[#d5650e] transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Funds
              </button>
              {/* Period selector */}
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#f47b20]"
                >
                  {['This Week', 'This Month', 'Last 3 Months', 'This Year'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ── Stat Cards — white wrapper, 2×2 grid ── */}
<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
  <div className="grid grid-cols-2 gap-4">
    {[
      { key: 'total',     title: 'Wallet Total', amount: fmt(total),     change: '-0.10%', positive: false, icon: <Wallet className="w-5 h-5" />      },
      { key: 'available', title: 'Available',    amount: fmt(available), change: '+1.10%', positive: true,  icon: <DollarSign className="w-5 h-5" />   },
      { key: 'locked',    title: 'Locked',       amount: fmt(locked),    change: '+1.10%', positive: true,  icon: <Lock className="w-5 h-5" />         },
      { key: 'pending',   title: 'Pending',      amount: fmt(pending),   change: '+2.10%', positive: false, icon: <TrendingUp className="w-5 h-5" />   },
    ].map((card) => {
      const isActive = activeCard === card.key;
      return (
        <button
          key={card.key}
          type="button"
          onClick={() => setActiveCard(card.key)}
          className={`text-left rounded-xl p-5 flex flex-col gap-3 border transition-all cursor-pointer ${
            isActive
              ? 'bg-[#fef3e8] border-[#f47b20]'
              : 'bg-[#ffff] border-[#f9d5b3] hover:border-[#f47b20]'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className={`text-sm font-medium ${isActive ? 'text-black' : 'text-black'}`}>
              {card.title}
            </span>
            <span className={`p-2 rounded-md ${isActive ? 'bg-orange-200 text-white' : 'bg-[#f47b20]/10 text-[#f47b20]'}`}>
              {card.icon}
            </span>
          </div>
          <p className={`text-2xl font-bold ${isActive ? 'text-black' : 'text-gray-900'}`}>
            {card.amount}
          </p>
          <p className={`text-xs font-medium ${
            isActive ? 'text-black' : card.positive ? 'text-green-500' : 'text-red-400'
          }`}>
            {card.change} {card.positive ? '↑' : '↓'} Since last week
          </p>
        </button>
      );
    })}
  </div>
</div>

          {/* ── Transactions Table ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Tabs + Filter */}
            <div className="flex items-center justify-between px-6 pt-4 border-b border-gray-100">
              <div className="flex gap-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setPage(1); }}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-[#f47b20] text-[#f47b20]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors mb-2">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 text-xs font-medium uppercase tracking-wide">
                    {['Transaction ID', 'Date & Time', 'Type', 'Description', 'Category', 'Reference', 'Job Type', 'Amount', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        {Array.from({ length: 10 }).map((__, j) => (
                          <td key={j} className="px-4 py-4">
                            <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-gray-400 text-sm">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">
                          {tx.transaction_id ?? tx.id?.slice(0, 16).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          <div>{tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-CA', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</div>
                          <div className="text-xs text-gray-400">{tx.created_at ? new Date(tx.created_at).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                        </td>
                        <td className="px-4 py-3">{typeBadge(tx.type)}</td>
                        <td className="px-4 py-3 text-gray-700 max-w-[180px]">
                          <p className="truncate">{tx.description ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3">{categoryBadge(tx.category ?? '')}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                          {tx.reference ?? tx.job_id ?? '—'}
                        </td>
                        <td className="px-4 py-3">{jobTypeBadge(tx.job_type ?? '')}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                          {tx.amount != null ? `$${(Number(tx.amount) / 100).toFixed(0)}/hr` : '—'}
                        </td>
                        <td className="px-4 py-3">{statusBadge(tx.status)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => router.push(`/wallet/transactions/${tx.id}`)}
                            className="text-gray-400 hover:text-[#f47b20] transition-colors"
                            aria-label="View transaction"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-1">
                  {pageNumbers().map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(Number(p))}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === p
                            ? 'bg-[#f47b20] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
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
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-700">{showingFrom}–{showingTo}</span> of{' '}
                  <span className="font-medium text-gray-700">{totalItems}</span> Jobs
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
    </>
  );
}