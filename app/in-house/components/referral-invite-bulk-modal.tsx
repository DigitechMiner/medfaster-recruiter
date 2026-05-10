'use client';

import { useEffect, useRef, useState, type ChangeEventHandler } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Loader2,
  Plus,
  Upload,
  X,
} from 'lucide-react';
import type { PostReferralInvitesResponse } from '@/features/candidates';
import { postReferralInvites } from '@/features/candidates';

type ReferralInviteSuccessData = PostReferralInvitesResponse['data'];

type StaffEntry = { name: string; email: string };
type EntryError = { name?: string; email?: string };

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function validateEntries(entries: StaffEntry[]): EntryError[] {
  return entries.map((e) => {
    const errors: EntryError = {};
    const any = e.name.trim() || e.email.trim();
    if (!any) return {};
    if (!e.email.trim()) errors.email = 'Email is required';
    else if (!EMAIL_REGEX.test(e.email.trim())) errors.email = 'Enter a valid email address';
    return errors;
  });
}

function hasErrors(errors: EntryError[]): boolean {
  return errors.some((e) => e.name || e.email);
}

/** Merge CSV / pasted lines into rows: `Name,email`, `email,name`, or email-only lines */
export function parseBulkInviteLines(raw: string): StaffEntry[] {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out: StaffEntry[] = [];
  const headerRe = /^(full\s*name|name|email|e-?mail)$/i;
  for (const line of lines) {
    const cells = line.split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
    if (cells.length >= 2) {
      const [a, b] = cells;
      if (headerRe.test(a) || headerRe.test(b)) continue;
      if (a.includes('@')) {
        out.push({ name: b || '', email: a });
      } else {
        out.push({ name: a, email: b });
      }
    } else if (cells.length === 1 && cells[0].includes('@')) {
      if (headerRe.test(cells[0])) continue;
      out.push({ name: '', email: cells[0] });
    }
  }
  return out;
}

function dedupeByEmail(entries: StaffEntry[]): StaffEntry[] {
  const seen = new Set<string>();
  const next: StaffEntry[] = [];
  for (const e of entries) {
    const key = e.email.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    next.push({ name: e.name.trim(), email: e.email.trim() });
  }
  return next;
}

function ReferralInviteSuccessOverlay({
  data,
  onDone,
}: {
  data: ReferralInviteSuccessData;
  onDone: () => void;
}) {
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(data.referral_code);
      toast.success('Referral code copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
      <div
        role="dialog"
        aria-labelledby="referral-result-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[min(85vh,720px)] flex flex-col overflow-hidden border border-gray-100"
      >
        <div className="px-6 pt-8 pb-4 text-center shrink-0 border-b border-gray-100 bg-orange-50/40">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="text-green-600" size={32} strokeWidth={2} />
          </div>
          <h3 id="referral-result-title" className="text-lg font-bold text-gray-900">
            Invites processed
          </h3>
          <p className="mt-1 text-[13px] text-gray-500">Summary from the server response</p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5 text-[13px]">
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Referral code</p>
            <div className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50/50 px-3 py-2.5">
              <code className="flex-1 min-w-0 break-all font-mono text-[13px] text-gray-900">{data.referral_code}</code>
              <button
                type="button"
                onClick={copyCode}
                className="shrink-0 flex items-center gap-1 rounded-lg border border-orange-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#F4781B] hover:bg-orange-50"
              >
                <Copy size={14} /> Copy
              </button>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3 text-center">
              <p className="text-xl font-bold text-gray-900">{data.invited_count}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Sent</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3 text-center">
              <p className="text-xl font-bold text-amber-700">{data.skipped_existing_users_count}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Skipped (registered)</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3 text-center">
              <p className="text-xl font-bold text-amber-700">{data.skipped_already_invited_count}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Skipped (pending)</p>
            </div>
          </section>

          {data.invited.length > 0 && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Invited ({data.invited.length})
              </p>
              <ul className="rounded-xl border border-gray-100 divide-y divide-gray-100 max-h-40 overflow-y-auto">
                {data.invited.map((row) => (
                  <li key={row.invite_id} className="px-3 py-2.5 space-y-1">
                    <p className="font-medium text-gray-900">{row.email}</p>
                    <p className="text-[11px] text-gray-400 font-mono break-all">Invite ID: {row.invite_id}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(data.skipped_existing_users.length > 0 || data.skipped_already_invited.length > 0) && (
            <section className="space-y-3">
              {data.skipped_existing_users.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 mb-2">
                    Already registered ({data.skipped_existing_users.length})
                  </p>
                  <ul className="rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2 text-[12px] text-gray-700 space-y-1 max-h-28 overflow-y-auto">
                    {data.skipped_existing_users.map((email) => (
                      <li key={email}>{email}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.skipped_already_invited.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 mb-2">
                    Already pending invite ({data.skipped_already_invited.length})
                  </p>
                  <ul className="rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2 text-[12px] text-gray-700 space-y-1 max-h-28 overflow-y-auto">
                    {data.skipped_already_invited.map((email) => (
                      <li key={email}>{email}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={onDone}
            className="w-full bg-[#F4781B] hover:bg-[#e06a10] text-white text-[15px] font-semibold py-3 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReferralInviteBulkModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<StaffEntry[]>([{ name: '', email: '' }]);
  const [errors, setErrors] = useState<EntryError[]>([{}]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<ReferralInviteSuccessData | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) setSuccessData(null);
  }, [open]);

  const updateEntry = (i: number, field: keyof StaffEntry, val: string) => {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, [field]: val } : e)));
    setErrors((prev) => prev.map((err, idx) => (idx === i ? { ...err, [field]: undefined } : err)));
  };

  const addRow = () => {
    setEntries((prev) => [...prev, { name: '', email: '' }]);
    setErrors((prev) => [...prev, {}]);
  };

  const removeRow = (i: number) => {
    if (entries.length === 1) return;
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
    setErrors((prev) => prev.filter((_, idx) => idx !== i));
  };

  const mergeParsed = (parsed: StaffEntry[]) => {
    if (parsed.length === 0) {
      toast.info('No valid rows found in file.');
      return;
    }
    const merged = dedupeByEmail([...entries.filter((e) => e.name.trim() || e.email.trim()), ...parsed]);
    setEntries(merged.length ? merged : [{ name: '', email: '' }]);
    setErrors(merged.map(() => ({})));
    toast.success(`Loaded ${parsed.length} row(s). Review and send when ready.`);
  };

  const onPickFile: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const parsed = parseBulkInviteLines(text);
      mergeParsed(parsed);
    };
    reader.onerror = () => toast.error('Could not read file.');
    reader.readAsText(file);
  };

  const mutation = useMutation({
    mutationFn: (body: { name?: string; email: string }[]) => postReferralInvites(body),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['referral-invites'] });
      setEntries([{ name: '', email: '' }]);
      setErrors([{}]);
      setSubmitError(null);
      setSuccessData(res.data);
    },
    onError: (err: Error) => {
      toast.error(err?.message || 'Failed to send invites.');
    },
  });

  const handleSend = () => {
    setSubmitError(null);
    const validated = validateEntries(entries);
    if (hasErrors(validated)) {
      setErrors(validated);
      return;
    }
    const filled = entries.filter((e) => e.email.trim());
    if (filled.length === 0) {
      setSubmitError('Add at least one email address.');
      return;
    }
    mutation.mutate(
      filled.map((e) => ({
        name: e.name.trim() || undefined,
        email: e.email.trim(),
      })),
    );
  };

  if (!open) return null;

  const dismissSuccess = () => {
    setSuccessData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <input ref={fileInputRef} type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" onChange={onPickFile} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 p-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-[15px] font-bold text-gray-900">Referral invite candidates</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-[12px] font-medium px-3.5 py-2 rounded-xl transition-colors"
            >
              <Upload size={13} /> Bulk upload
            </button>
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white text-[12px] font-semibold px-3.5 py-2 rounded-xl transition-colors"
            >
              <Plus size={13} /> Add more
            </button>
          </div>
        </div>
        <p className="text-[13px] text-gray-500 mb-3 shrink-0">
          Invite candidates who are not on the platform yet. They will receive an email with your referral code. Use bulk upload for a CSV or text file with{' '}
          <span className="font-medium text-gray-700">Name,email</span> per line.
        </p>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-4 mb-2 px-1 shrink-0">
          <span className="text-[12px] text-gray-500 font-medium">Full name (optional)</span>
          <span className="text-[12px] text-gray-500 font-medium">Email</span>
          <span className="w-6" />
        </div>
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
          {entries.map((entry, i) => (
            <div key={`entry-${i}`} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-start">
              <div className="flex flex-col gap-1">
                <input
                  value={entry.name}
                  onChange={(e) => updateEntry(i, 'name', e.target.value)}
                  placeholder="Full name"
                  className={`border rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 outline-none transition-colors ${errors[i]?.name ? 'border-red-400 focus:border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-[#F4781B]'}`}
                />
                {errors[i]?.name && (
                  <span className="flex items-center gap-1 text-[11px] text-red-500">
                    <AlertCircle size={11} /> {errors[i].name}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <input
                  value={entry.email}
                  onChange={(e) => updateEntry(i, 'email', e.target.value)}
                  placeholder="email@example.com"
                  className={`border rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 outline-none transition-colors ${errors[i]?.email ? 'border-red-400 focus:border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-[#F4781B]'}`}
                />
                {errors[i]?.email && (
                  <span className="flex items-center gap-1 text-[11px] text-red-500">
                    <AlertCircle size={11} /> {errors[i].email}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeRow(i)}
                disabled={entries.length === 1}
                className={`mt-2.5 transition-colors ${entries.length === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-red-400'}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        {submitError && (
          <p className="mt-3 text-[11px] text-red-500 text-center flex items-center justify-center gap-1">
            <AlertCircle size={12} /> {submitError}
          </p>
        )}
        <div className="flex items-center justify-between mt-6 shrink-0">
          <p className="text-[12px] text-gray-400">
            {entries.filter((e) => e.email.trim()).length} invite(s) ready to send
          </p>
          <button
            type="button"
            onClick={handleSend}
            disabled={mutation.isPending}
            className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Sending…
              </>
            ) : (
              <>
                Send invites <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
      {successData && <ReferralInviteSuccessOverlay data={successData} onDone={dismissSuccess} />}
    </div>
  );
}
