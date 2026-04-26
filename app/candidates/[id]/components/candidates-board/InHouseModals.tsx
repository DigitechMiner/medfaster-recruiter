"use client";

import { useState } from "react";
import { Upload, Plus, ArrowRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useInviteCandidate } from "@/hooks/useRecruiterData";

type StaffEntry = { name: string; email: string };

interface AddInHouseModalProps {
  onClose: () => void;
  onSuccess: (count: number) => void;
  onPartialFail?: (failedEmails: string[]) => void;
  candidateId: string;
  jobId: string;
}

export function AddInHouseModal({
  onClose,
  onSuccess,
  onPartialFail,
  candidateId,
  jobId,
}: AddInHouseModalProps) {
  const [entries, setEntries] = useState<StaffEntry[]>([{ name: "", email: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { invite } = useInviteCandidate();

  const updateEntry = (i: number, field: keyof StaffEntry, val: string) => {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, [field]: val } : e)));
  };

  const addRow = () =>
    setEntries((prev) => [...prev, { name: "", email: "" }]);

  const handleSend = async () => {
    const filled = entries.filter((e) => e.name.trim() && e.email.trim());
    if (filled.length === 0) {
      setSubmitError("Please fill in at least one name and email.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (candidateId && jobId) {
        const res = await invite({ candidate_id: candidateId, job_id: jobId });
        if (!res.success) {
          // Partial fail — pass failed emails to parent
          const failedEmails = filled.map((e) => e.email);
          onPartialFail?.(failedEmails);
          setIsSubmitting(false);
          return;
        }
      }
      onSuccess(filled.length);
    } catch {
      setSubmitError("Failed to send invitation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-[12px] font-medium px-3.5 py-2 rounded-xl transition-colors">
              <Upload size={13} /> Bulk Upload
            </button>
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white text-[12px] font-semibold px-3.5 py-2 rounded-xl transition-colors"
            >
              <Plus size={13} /> Add More
            </button>
          </div>
        </div>

        {/* Entries */}
        <div className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-1">
          {entries.map((entry, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-gray-500 font-medium">Full Name</label>
                <input
                  value={entry.name}
                  onChange={(e) => updateEntry(i, "name", e.target.value)}
                  placeholder="Ajay Shah"
                  className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-[#F4781B] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-gray-500 font-medium">Email Id</label>
                <input
                  value={entry.email}
                  onChange={(e) => updateEntry(i, "email", e.target.value)}
                  placeholder="staff@hospital.com"
                  className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-[#F4781B] transition-colors"
                />
              </div>
            </div>
          ))}
        </div>

        {submitError && (
          <p className="mt-3 text-[11px] text-red-500 text-center">{submitError}</p>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSend}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {isSubmitting ? "Sending..." : "Send Invitation"}
            {!isSubmitting && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Success Modal ─────────────────────────────────────────────────────────────
export function SuccessModal({ count, onDone }: { count: number; onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 px-8 pt-10 pb-8 flex flex-col items-center gap-5 text-center">
        {/* Layered green icon */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-green-100 opacity-50" />
          <div className="absolute inset-3 rounded-full bg-green-100" />
          <div className="relative w-14 h-14 rounded-full bg-white border-2 border-green-400 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-green-500" strokeWidth={1.8} />
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[17px] font-bold text-gray-900 leading-snug">
            Invitations Sent to {count} Candidate{count !== 1 ? "s" : ""} !
          </p>
          <p className="text-[13px] text-gray-400">
            You will be notified once they are enrolled
          </p>
        </div>

        <button
          onClick={onDone}
          className="w-full bg-[#F4781B] hover:bg-[#e06a10] text-white text-[15px] font-semibold py-3.5 rounded-xl transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ── Partial Fail Modal ────────────────────────────────────────────────────────
export function PartialFailModal({
  failedEmails,
  onClose,
}: {
  failedEmails: string[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 px-8 pt-10 pb-8 flex flex-col items-center gap-5 text-center">
        {/* Same layered green icon as success */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-green-100 opacity-50" />
          <div className="absolute inset-3 rounded-full bg-green-100" />
          <div className="relative w-14 h-14 rounded-full bg-white border-2 border-green-400 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-green-500" strokeWidth={1.8} />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[17px] font-bold text-gray-900 leading-snug">
            Invitation Not Sent to {failedEmails.length} Candidate{failedEmails.length !== 1 ? "s" : ""} !
          </p>
          {/* Bullet list of failed emails */}
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
          className="w-full bg-[#F4781B] hover:bg-[#e06a10] text-white text-[15px] font-semibold py-3.5 rounded-xl transition-colors"
        >
          ok
        </button>
      </div>
    </div>
  );
}