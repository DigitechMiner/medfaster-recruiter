'use client';

import { useEffect, useState }  from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getWalletTransactions, WalletTransaction } from '@/stores/api/recruiter-wallet-api';
import {
  ArrowLeft, Copy, CheckCheck,
  Wallet, ArrowDownCircle, ArrowUpCircle,
  Clock, CheckCircle2, XCircle, RefreshCw,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(cents: number) {
  return `$ ${(cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function safeDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

function fmtDate(iso?: string): string {
  const d = safeDate(iso);
  return d ? d.toLocaleDateString('en-CA', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';
}

function fmtTime(iso?: string): string {
  const d = safeDate(iso);
  return d ? d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A';
}

// ── Chips ─────────────────────────────────────────────────────────────────────
function Chip({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

function TypeChip({ type }: { type: string }) {
  const t = type.toUpperCase();
  if (t === 'TOPUP' || t === 'DEPOSIT')
    return <Chip label="Top-up"      className="bg-green-100 text-green-700"   />;
  if (t === 'ESCROW_HOLD')
    return <Chip label="Escrow Hold" className="bg-blue-100 text-blue-700"     />;
  if (t === 'ESCROW_RELEASE' || t === 'JOB_PAYMENT')
    return <Chip label="Released"    className="bg-orange-100 text-orange-600" />;
  if (t === 'REFUND')
    return <Chip label="Refund"      className="bg-green-100 text-green-700"   />;
  if (t === 'WITHDRAWAL')
    return <Chip label="Withdrawal"  className="bg-red-100 text-red-600"       />;
  return   <Chip label={type}        className="bg-gray-100 text-gray-600"     />;
}

function StatusChip({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === 'COMPLETED' || s === 'SUCCESS')
    return <Chip label="Completed" className="bg-green-100 text-green-700"    />;
  if (s === 'PENDING')
    return <Chip label="Pending"   className="bg-yellow-100 text-yellow-700"  />;
  if (s === 'FAILED')
    return <Chip label="Failed"    className="bg-red-100 text-red-600"        />;
  return   <Chip label={status}   className="bg-gray-100 text-gray-600"       />;
}

function DirectionIcon({ direction }: { direction: string }) {
  const d = direction.toUpperCase();
  if (d === 'CREDIT' || d === 'RELEASE' || d === 'REFUND')
    return <ArrowDownCircle className="w-6 h-6 text-green-500" />;
  if (d === 'DEBIT' || d === 'HOLD')
    return <ArrowUpCircle className="w-6 h-6 text-orange-500" />;
  return <Wallet className="w-6 h-6 text-gray-400" />;
}

function StatusIcon({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === 'COMPLETED' || s === 'SUCCESS') return <CheckCircle2 className="w-10 h-10 text-green-500"  />;
  if (s === 'PENDING')                      return <Clock        className="w-10 h-10 text-yellow-500" />;
  if (s === 'FAILED')                       return <XCircle      className="w-10 h-10 text-red-500"    />;
  return                                           <RefreshCw    className="w-10 h-10 text-gray-400"   />;
}

function amountDisplay(tx: WalletTransaction) {
  const d     = tx.direction?.toUpperCase();
  const cents = Number(tx.amount);
  const value = fmt(cents);
  if (d === 'CREDIT' || d === 'RELEASE' || d === 'REFUND') return { label: `+ ${value}`, className: 'text-green-600' };
  if (d === 'DEBIT'  || d === 'HOLD')                      return { label: `- ${value}`, className: 'text-red-500'   };
  return { label: value, className: 'text-gray-800' };
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }}
      className="text-gray-400 hover:text-[#f47b20] transition-colors ml-1.5 flex-shrink-0"
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Detail row ────────────────────────────────────────────────────────────────
function Row({ label, value, mono = false, copyable = false, children }: {
  label: string; value?: string; mono?: boolean; copyable?: boolean; children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-[13px] text-gray-400 shrink-0 w-44">{label}</span>
      {children ? (
        <div className="flex-1 flex justify-end">{children}</div>
      ) : (
        <div className="flex items-center justify-end flex-1 min-w-0">
          <span className={`text-[13px] text-gray-800 text-right break-all ${mono ? 'font-mono text-[12px]' : 'font-medium'}`}>
            {value ?? '—'}
          </span>
          {copyable && value && <CopyButton value={value} />}
        </div>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-5 w-32 bg-gray-100 rounded" />
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex justify-center"><div className="w-14 h-14 rounded-full bg-gray-100" /></div>
        <div className="h-8 w-40 bg-gray-100 rounded mx-auto" />
        <div className="h-4 w-24 bg-gray-100 rounded mx-auto" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3.5 w-28 bg-gray-100 rounded" />
            <div className="h-3.5 w-36 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const [tx,      setTx]      = useState<WalletTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      try {
        // No dedicated GET /transactions/:id — search through pages
        for (const limit of [20, 50, 100]) {
          const res   = await getWalletTransactions({ page: 1, limit });
          const found = res.items.find((t) => t.id === id || t.transaction_id === id);
          if (found) { if (!cancelled) setTx(found); return; }
          if ((res.total ?? res.items.length) <= limit) break;
        }
        throw new Error('Transaction not found');
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load transaction');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  const { label: amtLabel, className: amtClass } = tx
    ? amountDisplay(tx)
    : { label: '', className: '' };

  // Resolve job_id from metadata or top-level
  const jobId   = tx ? ((tx.metadata?.job_id as string | undefined) ?? tx.job_id ?? null) : null;
  const hasRefs = tx && (tx.reference_group_id || tx.idempotency_key || jobId);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f8f7f5] overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Wallet
        </button>

        {loading && <Skeleton />}

        {error && !loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-800">Transaction not found</p>
            <p className="text-[13px] text-gray-400 mt-1">{error}</p>
            <button onClick={() => router.push('/wallet')} className="mt-4 text-[13px] text-[#f47b20] font-semibold hover:underline">
              Return to Wallet
            </button>
          </div>
        )}

        {tx && !loading && (
          <>
            {/* Hero */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <StatusIcon status={tx.status} />
                </div>
              </div>
              <div>
                <p className={`text-[32px] font-bold tracking-tight ${amtClass}`}>{amtLabel}</p>
                {tx.created_at ? (
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    {fmtDate(tx.created_at)} · {fmtTime(tx.created_at)}
                  </p>
                ) : (
                  <p className="text-[13px] text-gray-300 mt-0.5">Date not available</p>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <TypeChip type={tx.type} />
                <StatusChip status={tx.status} />
                <div className="flex items-center gap-1">
                  <DirectionIcon direction={tx.direction ?? ''} />
                  <span className="text-[12px] text-gray-500 capitalize">{tx.direction?.toLowerCase() ?? '—'}</span>
                </div>
              </div>
              {tx.description && (
                <p className="text-[13px] text-gray-500 max-w-xs mx-auto">{tx.description}</p>
              )}
            </div>

            {/* Transaction Details */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-2">
              <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide pt-4 pb-1">Transaction Details</p>
              <Row label="Internal ID"    value={tx.id}                   mono copyable />
              {tx.transaction_id && <Row label="Transaction ID" value={tx.transaction_id} mono copyable />}
              <Row label="Type"           ><TypeChip type={tx.type} /></Row>
              <Row label="Direction"      value={tx.direction ?? '—'} />
              <Row label="Status"         ><StatusChip status={tx.status} /></Row>
              <Row label="Amount"         value={fmt(Number(tx.amount))} />
              {tx.balance_after && <Row label="Balance After"  value={fmt(Number(tx.balance_after))} />}
              <Row label="Currency"       value={tx.currency ?? 'CAD'} />
              <Row label="Date"           value={fmtDate(tx.created_at)} />
              <Row label="Time"           value={fmtTime(tx.created_at)} />
            </div>

            {/* Reference Details */}
            {hasRefs && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-2">
                <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide pt-4 pb-1">Reference Details</p>
                {tx.reference_group_id && <Row label="Reference Group ID" value={tx.reference_group_id} mono copyable />}
                {tx.idempotency_key    && <Row label="Idempotency Key"    value={tx.idempotency_key}    mono copyable />}
                {jobId                 && <Row label="Job ID"             value={jobId}                 mono copyable />}
              </div>
            )}

            {/* Metadata */}
            {tx.metadata && Object.keys(tx.metadata).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-2">
                <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide pt-4 pb-1">Metadata</p>
                {Object.entries(tx.metadata).map(([k, v]) => (
                  <Row
                    key={k}
                    label={k.replace(/_/g, ' ')}
                    value={typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    mono
                  />
                ))}
              </div>
            )}

            <div className="pb-6 text-center">
              <button onClick={() => router.push('/wallet')} className="text-[13px] text-gray-400 hover:text-gray-600 transition-colors">
                ← Back to Wallet
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}