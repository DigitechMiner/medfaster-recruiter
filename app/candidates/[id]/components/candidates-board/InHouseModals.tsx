"use client";

import { useState } from "react";
import { Upload, Plus, ArrowRight, ChevronLeft, CheckCircle2 } from "lucide-react";

type StaffEntry = { name: string; email: string; phone: string };

export function AddInHouseModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (count: number) => void;
}) {
  const [entries, setEntries] = useState<StaffEntry[]>([
    { name: "", email: "", phone: "" },
  ]);

  const updateEntry = (i: number, field: keyof StaffEntry, val: string) => {
    setEntries((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  };

  const addRow = () => setEntries((prev) => [...prev, { name: "", email: "", phone: "" }]);

  const handleSend = () => {
    const filled = entries.filter((e) => e.name.trim() || e.email.trim());
    onSuccess(filled.length || entries.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-base font-bold text-gray-900">Add In-House Staff</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium px-3 py-2 rounded-xl transition-colors">
              <Upload size={13} /> Bulk Upload
            </button>
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <Plus size={13} /> Add More
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-1">
          {entries.map((entry, i) => (
            <div key={i} className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Full Name</label>
                <input
                  value={entry.name}
                  onChange={(e) => updateEntry(i, "name", e.target.value)}
                  placeholder="Ajay Shah"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Email Id</label>
                <input
                  value={entry.email}
                  onChange={(e) => updateEntry(i, "email", e.target.value)}
                  placeholder="staff@hospital.com"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Phone Number</label>
                <input
                  value={entry.phone}
                  onChange={(e) => updateEntry(i, "phone", e.target.value)}
                  placeholder="+1 987 654 3210"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 transition-colors"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={handleSend}
            className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Send Invitation <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SuccessModal({
  count,
  onDone,
}: {
  count: number;
  onDone: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 flex flex-col items-center gap-4 text-center">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-40" />
          <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-green-500" />
          </div>
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">
            Invitations Sent to {count} Candidate{count !== 1 ? "s" : ""} !
          </p>
          <p className="text-xs text-gray-400 mt-1">You will be notified once they are enrolled</p>
        </div>
        <button
          onClick={onDone}
          className="w-full bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold py-3 rounded-xl transition-colors mt-1"
        >
          Done
        </button>
      </div>
    </div>
  );
}
