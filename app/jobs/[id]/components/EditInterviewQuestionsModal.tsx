"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, X, Sparkles, Loader2 } from "lucide-react";

interface Question {
  id:   string;
  text: string;
}

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  initialQuestions?: string[];
  onSave:    (questions: string[]) => Promise<void>;
}

let _id = 0;
const uid = () => `q-${++_id}`;

export const EditInterviewQuestionsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialQuestions = [],
  onSave,
}) => {
  const [questions, setQuestions] = useState<Question[]>(() =>
    initialQuestions.length > 0
      ? initialQuestions.map((t) => ({ id: uid(), text: t }))
      : Array.from({ length: 5 }, () => ({ id: uid(), text: '' }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving]   = useState(false);
  const [isAI, setIsAI]           = useState(false);

  // ── ALL hooks before early return ──────────────────────────
  if (!isOpen) return null;

  const handleAdd = () => {
    setQuestions((prev) => [...prev, { id: uid(), text: '' }]);
  };

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleChange = (id: string, text: string) => {
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, text } : q));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(questions.map((q) => q.text).filter(Boolean));
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleRephrase = async () => {
    setIsAI(true);
    // TODO: wire to AI API
    await new Promise((r) => setTimeout(r, 1500));
    setIsAI(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl w-full max-w-3xl flex flex-col shadow-xl"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-900 font-bold text-xl hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={20} />
              Edit Interview Questions
            </button>
          </div>

          {/* Sub-header: label + AI rephrase + Add More */}
          <div className="flex items-center justify-between px-6 pb-5">
            <span className="text-sm font-semibold text-gray-900">
              Write Your Questions Here
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRephrase}
                disabled={isAI}
                className="flex items-center gap-1.5 text-[#F4781B] text-sm font-semibold italic hover:opacity-75 transition-opacity disabled:opacity-50"
              >
                {isAI
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Sparkles size={14} />
                }
                Rephrase Questions with KeReaeva&apos;s AI
              </button>
              <span className="text-gray-400 text-sm">or</span>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
              >
                <Plus size={15} strokeWidth={2.5} />
                Add More
              </button>
            </div>
          </div>

          {/* Question list */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 flex flex-col gap-5">
            {questions.map((q, idx) => (
              <div key={q.id} className="flex items-center gap-3">
                {/* Label */}
                <span className="text-sm font-semibold text-gray-900 whitespace-nowrap w-28 flex-shrink-0">
                  Questions {idx + 1} )
                </span>

                {/* Input */}
                {editingId === q.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={q.text}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                    className="flex-1 px-4 py-3 text-sm text-gray-900 border border-[#F4781B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4781B]/30"
                    placeholder="Type your question here..."
                  />
                ) : (
                  <div
                    className="flex-1 px-4 py-3 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-xl cursor-text select-none"
                    onClick={() => setEditingId(q.id)}
                  >
                    {q.text || 'Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?'}
                  </div>
                )}

                {/* Edit icon */}
                <button
                  onClick={() => setEditingId(q.id)}
                  className="flex-shrink-0 text-green-500 hover:text-green-600 transition-colors"
                  title="Edit"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>

                {/* Delete icon */}
                <button
                  onClick={() => handleDelete(q.id)}
                  className="flex-shrink-0 text-red-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <X size={14} />
              Close
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold px-7 py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
              Update Questions
              {!isSaving && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};