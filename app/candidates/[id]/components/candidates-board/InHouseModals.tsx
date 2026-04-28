"use client";

import { useState }   from "react";
import { Upload, Plus, ArrowRight, ChevronLeft, CheckCircle2, X, AlertCircle } from "lucide-react";
import { useInviteCandidate } from "@/hooks/useRecruiterData";

// ── Types ─────────────────────────────────────────────────────────────────────
export type StaffEntry = { name: string; email: string };
type EntryError = { name?: string; email?: string };

// ── Constants ─────────────────────────────────────────────────────────────────
const USE_MOCK = true; // ✅ flip to false when API is ready
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

// ── Helpers ───────────────────────────────────────────────────────────────────
function validateEntries(entries: StaffEntry[]): EntryError[] {
  return entries.map((e) => {
    const errors: EntryError = {};
    if (!e.name.trim())                       errors.name  = "Name is required";
    if (!e.email.trim())                      errors.email = "Email is required";
    else if (!EMAIL_REGEX.test(e.email.trim())) errors.email = "Enter a valid email address";
    return errors;
  });
}

function hasErrors(errors: EntryError[]): boolean {
  return errors.some((e) => e.name || e.email);
}

// ── AddInHouseModal ───────────────────────────────────────────────────────────
interface AddInHouseModalProps {
  onClose:        () => void;
  onSuccess:      (count: number, entries: StaffEntry[]) => void; // ← changed
  onPartialFail?: (failedEmails: string[]) => void;
  candidateId:    string;
  jobId:          string;
}
export function AddInHouseModal({
  onClose,
  onSuccess,
  onPartialFail,
  candidateId,
  jobId,
}: AddInHouseModalProps) {
  const [entries,     setEntries]     = useState<StaffEntry[]>([{ name: "", email: "" }]);
  const [errors,      setErrors]      = useState<EntryError[]>([{}]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { invite } = useInviteCandidate();

  // ── Entry mutations ───────────────────────────────────────────────────────
  const updateEntry = (i: number, field: keyof StaffEntry, val: string) => {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, [field]: val } : e)));
    // Clear the specific field error on change
    setErrors((prev) =>
      prev.map((err, idx) => (idx === i ? { ...err, [field]: undefined } : err))
    );
  };

  const addRow = () => {
    setEntries((prev) => [...prev, { name: "", email: "" }]);
    setErrors((prev)  => [...prev, {}]);
  };

  const removeRow = (i: number) => {
    if (entries.length === 1) return; // always keep at least one row
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
    setErrors((prev)  => prev.filter((_, idx) => idx !== i));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    setSubmitError(null);

    // 1. Validate all rows
    const validated = validateEntries(entries);
    if (hasErrors(validated)) {
      setErrors(validated);
      return; // stop — show inline errors
    }

    // 2. Filter only filled rows (extra safety)
    const filled = entries.filter((e) => e.name.trim() && e.email.trim());

    setIsSubmitting(true);
    try {
      // ── MOCK mode ──────────────────────────────────────────────────────
     if (USE_MOCK) {
  await new Promise((r) => setTimeout(r, 800));
  onSuccess(filled.length, filled); // ✅ pass entries
  return;
}

      // ── REAL API ───────────────────────────────────────────────────────
      if (candidateId && jobId) {
        const res = await invite({ candidate_id: candidateId, job_id: jobId });
        if (!res.success) {
          onPartialFail?.(filled.map((e) => e.email));
          return;
        }
      }
      onSuccess(filled.length, filled);
    } catch {
      setSubmitError("Failed to send invitation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-[15px] font-bold text-gray-900">Add In-House Staff</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600
                               hover:bg-gray-50 text-[12px] font-medium px-3.5 py-2 rounded-xl transition-colors">
              <Upload size={13} /> Bulk Upload
            </button>
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white
                         text-[12px] font-semibold px-3.5 py-2 rounded-xl transition-colors"
            >
              <Plus size={13} /> Add More
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1fr_auto] gap-4 mb-2 px-1">
          <span className="text-[12px] text-gray-500 font-medium">Full Name</span>
          <span className="text-[12px] text-gray-500 font-medium">Email Id</span>
          <span className="w-6" /> {/* spacer for remove button */}
        </div>

        {/* Entries */}
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
          {entries.map((entry, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-start">

              {/* Name */}
              <div className="flex flex-col gap-1">
                <input
                  value={entry.name}
                  onChange={(e) => updateEntry(i, "name", e.target.value)}
                  placeholder="Ajay Shah"
                  className={`border rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 outline-none
                              transition-colors ${
                                errors[i]?.name
                                  ? "border-red-400 focus:border-red-400 bg-red-50/30"
                                  : "border-gray-200 focus:border-[#F4781B]"
                              }`}
                />
                {errors[i]?.name && (
                  <span className="flex items-center gap-1 text-[11px] text-red-500">
                    <AlertCircle size={11} /> {errors[i].name}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <input
                  value={entry.email}
                  onChange={(e) => updateEntry(i, "email", e.target.value)}
                  placeholder="staff@hospital.com"
                  className={`border rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 outline-none
                              transition-colors ${
                                errors[i]?.email
                                  ? "border-red-400 focus:border-red-400 bg-red-50/30"
                                  : "border-gray-200 focus:border-[#F4781B]"
                              }`}
                />
                {errors[i]?.email && (
                  <span className="flex items-center gap-1 text-[11px] text-red-500">
                    <AlertCircle size={11} /> {errors[i].email}
                  </span>
                )}
              </div>

              {/* Remove row button — hidden on first row */}
              <button
                onClick={() => removeRow(i)}
                disabled={entries.length === 1}
                className={`mt-2.5 transition-colors ${
                  entries.length === 1
                    ? "text-gray-200 cursor-not-allowed"
                    : "text-gray-400 hover:text-red-400"
                }`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Global submit error */}
        {submitError && (
          <p className="mt-3 text-[11px] text-red-500 text-center flex items-center justify-center gap-1">
            <AlertCircle size={12} /> {submitError}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-[12px] text-gray-400">
            {entries.length} staff member{entries.length > 1 ? "s" : ""} to be invited
          </p>
          <button
            onClick={handleSend}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {isSubmitting ? "Sending…" : "Send Invitation"}
            {!isSubmitting && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SuccessModal + PartialFailModal unchanged below ───────────────────────────
export function SuccessModal({ count, onDone }: { count: number; onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 px-8 pt-10 pb-8
                      flex flex-col items-center gap-5 text-center">
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-green-100 opacity-50" />
          <div className="absolute inset-3 rounded-full bg-green-100" />
          <div className="relative w-14 h-14 rounded-full bg-white border-2 border-green-400
                          flex items-center justify-center">
            <CheckCircle2 size={28} className="text-green-500" strokeWidth={1.8} />
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-[17px] font-bold text-gray-900 leading-snug">
            Invitations Sent to {count} Candidate{count !== 1 ? "s" : ""}!
          </p>
          <p className="text-[13px] text-gray-400">
            You will be notified once they are enrolled
          </p>
        </div>
        <button
          onClick={onDone}
          className="w-full bg-[#F4781B] hover:bg-[#e06a10] text-white text-[15px]
                     font-semibold py-3.5 rounded-xl transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export function PartialFailModal({
  failedEmails,
  onClose,
}: {
  failedEmails: string[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 px-8 pt-10 pb-8
                      flex flex-col items-center gap-5 text-center">
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-green-100 opacity-50" />
          <div className="absolute inset-3 rounded-full bg-green-100" />
          <div className="relative w-14 h-14 rounded-full bg-white border-2 border-green-400
                          flex items-center justify-center">
            <CheckCircle2 size={28} className="text-green-500" strokeWidth={1.8} />
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-[17px] font-bold text-gray-900 leading-snug">
            Invitation Not Sent to {failedEmails.length} Candidate{failedEmails.length !== 1 ? "s" : ""}!
          </p>
          <ul className="space-y-1.5">
            {failedEmails.map((email, i) => (
              <li key={i} className="flex items-center gap-2 justify-center text-[14px] text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                {email}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-[#F4781B] hover:bg-[#e06a10] text-white text-[15px]
                     font-semibold py-3.5 rounded-xl transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}