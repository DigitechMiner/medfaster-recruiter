"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowLeft, ArrowRight, Pencil, Sparkles, Loader2, Check } from "lucide-react";
import { updateRecruiterJob } from "@/stores/api/recruiter-job-api";
import { useGenerateDescription } from "@/hooks/useGenerateDescription";
import type { JobDescriptionInput } from "@/stores/api/job-description.api";
import type { JobBackendResponse } from "@/Interface/job.types";

// ── Helpers ────────────────────────────────────────────────────
function htmlToPlainText(html: string): string {
  return html
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function plainTextToHtml(text: string): string {
  return text
    .split('\n\n')
    .map((para) => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

// ── Types ──────────────────────────────────────────────────────
interface JobDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (description: string) => void;
  job: JobBackendResponse;
}

// ── Modal ──────────────────────────────────────────────────────
export const JobDescriptionModal: React.FC<JobDescriptionModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  job,
}) => {
  // ✅ ALL hooks declared unconditionally at the top — no early returns before this block
  const [content, setContent]                     = useState(job.description ?? '');
  const [editableContent, setEditableContent]     = useState('');
  const [isEditing, setIsEditing]                 = useState(false);
  const [isSaving, setIsSaving]                   = useState(false);
  const [saveError, setSaveError]                 = useState<string | null>(null);
  const [successMsg, setSuccessMsg]               = useState<string | null>(null);

  const {
    description: aiDescription,
    loading: aiLoading,
    error: aiError,
    generateDescription,
    reset: resetAI,
  } = useGenerateDescription();

  // ✅ useEffect #1 — sync content when job.description changes
  useEffect(() => {
    setContent(job.description ?? '');
  }, [job.description]);

  // ✅ useEffect #2 — apply AI result when it arrives
  useEffect(() => {
    if (aiDescription && !aiLoading) {
      setContent(aiDescription);
      setIsEditing(false);
    }
  }, [aiDescription, aiLoading]);

  // ✅ Early return AFTER all hooks
  if (!isOpen) return null;

  // ── Build AI payload ───────────────────────────────────────
  const buildAIInput = (): JobDescriptionInput => {
    let jobType = job.job_type?.toLowerCase().replace(/\s+/g, '');
    if (jobType === 'fulltime')      jobType = 'Full Time';
    else if (jobType === 'parttime') jobType = 'Part Time';
    else if (jobType === 'casual')   jobType = 'Casual';
    else                             jobType = job.job_type || 'Full Time';

    const payPerHour = (job as JobBackendResponse & { pay_per_hour_cents?: number }).pay_per_hour_cents;
    const payRange = job.pay_range_max
      ? `$${job.pay_range_min} - $${job.pay_range_max}`
      : payPerHour
        ? `$${payPerHour}/hr`
        : undefined;

    return {
      jobTitle:           job.job_title,
      department:         job.department ?? '',
      jobType,
      location:           [job.city, job.province].filter(Boolean).join(', ') || undefined,
      payRange,
      experienceRequired: job.normalJob?.years_of_experience || undefined,
      qualification:      job.normalJob?.qualifications?.join(', ') || undefined,
      specialization:     job.normalJob?.specializations?.join(', ') || undefined,
      urgency:            job.job_urgency ?? undefined,
      inPersonInterview:  false,
      physicalInterview:  false,
    };
  };

  // ── Handlers ───────────────────────────────────────────────
  const handleRephrase = async () => {
    setSaveError(null);
    setSuccessMsg(null);
    resetAI();
    await generateDescription(buildAIInput());
  };

  const handleToggleEdit = () => {
    if (!isEditing) {
      setEditableContent(htmlToPlainText(content));
    }
    setIsEditing((v) => !v);
    setSaveError(null);
    setSuccessMsg(null);
  };

  const handleUpdate = async () => {
    const finalContent = isEditing ? plainTextToHtml(editableContent) : content;
    setIsSaving(true);
    setSaveError(null);
    setSuccessMsg(null);
    try {
      const res = await updateRecruiterJob(job.id, { description: finalContent });
      if (res.success) {
        setContent(finalContent);
        setIsEditing(false);
        setSuccessMsg('Description updated successfully.');
        onUpdate?.(finalContent);
        setTimeout(() => onClose(), 800);
      } else {
        setSaveError('Failed to update. Please try again.');
      }
    } catch {
      setSaveError('Failed to update. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── JSX ────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-gray-700 font-semibold text-base hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={18} />
              Job Description
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRephrase}
                disabled={aiLoading}
                className="flex items-center gap-1.5 text-[#F4781B] text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {aiLoading
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Sparkles size={14} />
                }
                <span className="italic">
                  {aiLoading ? 'Rephrasing...' : 'Rephrase Job Description with AI'}
                </span>
              </button>

              <span className="text-gray-400 text-sm">or</span>

              <button
                onClick={handleToggleEdit}
                className={`flex items-center gap-1.5 border text-sm font-medium px-3 py-1.5 rounded-lg transition-colors
                  ${isEditing
                    ? 'border-gray-400 bg-gray-100 text-gray-800'
                    : 'border-[#F4781B] text-[#F4781B] hover:bg-orange-50'
                  }`}
              >
                <Pencil size={13} />
                {isEditing ? 'Editing...' : 'Edit Manually'}
              </button>
            </div>
          </div>

          {/* Banners */}
          {aiError && (
            <div className="mx-6 mt-3 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-center justify-between">
              <span>{aiError}</span>
              <button onClick={handleRephrase} className="text-red-600 font-medium underline text-xs ml-3">
                Try Again
              </button>
            </div>
          )}
          {saveError && (
            <div className="mx-6 mt-3 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {saveError}
            </div>
          )}
          {successMsg && (
            <div className="mx-6 mt-3 px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-sm text-green-600 flex items-center gap-2">
              <Check size={14} /> {successMsg}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {aiLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-[#F4781B] animate-spin mb-4" />
                <p className="text-gray-600 text-center">Generating job description with AI...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            ) : isEditing ? (
              <textarea
                className="w-full min-h-[400px] text-sm text-gray-800 leading-relaxed border border-gray-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#F4781B]/30 focus:border-[#F4781B]"
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                placeholder="Write the job description here..."
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                {content || (
                  <span className="text-gray-400 italic">
                    No description yet. Click &quot;Rephrase Job Description with AI&quot; to generate one.
                  </span>
                )}
              </div>
            )}
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
              onClick={handleUpdate}
              disabled={isSaving || aiLoading}
              className="flex items-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              {isSaving
                ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                : <>Update Description <ArrowRight size={14} /></>
              }
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

// ── Hook ───────────────────────────────────────────────────────
export const useJobDescriptionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    open:  () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
};