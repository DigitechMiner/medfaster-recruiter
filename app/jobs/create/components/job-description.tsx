"use client";

import { useState } from "react";
import { Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGenerateDescription } from "@/hooks/useGenerateDescription";
import { JobDescriptionInput } from "@/stores/api/job-description.api";
import type { JobFormData } from "@/Interface/recruiter.types";
import { AIDescriptionModal } from "./job-description/ai-modal";
import { toast } from "react-toastify";


interface JobDescriptionProps {
  formData:       JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
  fieldErrors?:   Partial<Record<keyof JobFormData, string>>;
}

const LIST_SECTIONS: { key: keyof JobFormData; label: string; required?: boolean }[] = [
  { key: "responsibilities",  label: "Key Responsibilities", required: true },
  { key: "required_skills",   label: "Required Skills",      required: true },
  { key: "experienceList",    label: "Experience"                           },
  { key: "workingConditions", label: "Working Conditions"                   },
  { key: "whyJoin",           label: "Why Join Us?"                         },
];

// ── Inline editable list section ─────────────────────────────────────────────
function ListSection({
  title,
  required,
  items,
  onChange,
  error,
}: {
  title:     string;
  required?: boolean;
  items:     string[];
  onChange:  (items: string[]) => void;
  error?:    string;
}) {
  const normalized = items.length > 0 ? items : [""];

  const handleUpdate = (index: number, value: string) => {
    const next = [...normalized];
    next[index] = value;
    onChange(next);
  };

  const handleDelete = (index: number) => {
    const next = normalized.filter((_, i) => i !== index);
    onChange(next.length === 0 ? [""] : next);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          {title}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </h3>
        <Button
          type="button"
          onClick={() => onChange([...normalized, ""])}
          className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-orange-600 text-white text-xs font-semibold px-3 h-8 rounded-md shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add More
        </Button>
      </div>

      <div className="space-y-4 w-full">
        {normalized.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <Input
              value={item}
              onChange={(e) => handleUpdate(index, e.target.value)}
              placeholder="Lorem ipsum dolor sit amet consectetur adipiscing elit..."
              className="flex-1 h-11 border-gray-200 focus:border-[#F4781B] focus:ring-[#F4781B] rounded-xl"
            />
            <button
              type="button"
              className="text-green-500 hover:text-green-600 p-1 hover:bg-green-50 rounded transition-colors flex-shrink-0"
              aria-label="Edit item"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(index)}
              className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"
              aria-label="Delete item"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function JobDescription({ formData, updateFormData, fieldErrors = {} }: JobDescriptionProps) {
  const [showModal, setShowModal] = useState(false);
  const { result, loading, error, generateDescription, reset } = useGenerateDescription();

  const handleClose = () => {
    setShowModal(false);
    reset();
  };

  const handleGenerateWithAI = async () => {
  if (!formData.jobTitle) {
    toast.error("Please fill in Job Title before generating with AI");
    return;
  }

  setShowModal(true);

  const input: JobDescriptionInput = {
    jobTitle:   formData.jobTitle,
    department: formData.department || "",
    jobType:    formData.jobType    || "Full Time",
  };

  await generateDescription(input);
};

  // ── Apply all structured fields directly from API response ─────────────────
  const handleUse = () => {
    if (!result) return;

    updateFormData({
      // Summary / description box
      description:       result.description,

      // ── Each section gets its own unique array from the API ──
      responsibilities:  result.responsibilities?.length  > 0
                           ? result.responsibilities
                           : [""],
      required_skills:   result.required_skills?.length   > 0
                           ? result.required_skills
                           : [""],
      experienceList:    result.experience?.length         > 0
                           ? result.experience
                           : [""],
      workingConditions: result.working_conditions?.length > 0
                           ? result.working_conditions
                           : [""],
      whyJoin:           result.why_join?.length           > 0
                           ? result.why_join
                           : [""],
    });

    handleClose();
  };

  const handleRegenerate = async () => {
    reset();
    await handleGenerateWithAI();
  };

  return (
    <>
      <div className="space-y-2 sm:space-y-3 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Job Summary <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerateWithAI}
            disabled={loading}
            className="text-[#F4781B] hover:text-orange-600 hover:bg-orange-50 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 -mt-1 sm:mt-0"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Auto-Generate Job Description With KeRaeva&apos;s AI
          </Button>
        </div>

        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Enter job description or generate with AI..."
          className="w-full min-h-[120px] sm:min-h-[140px] resize-none text-sm"
          rows={5}
        />
        {fieldErrors.description && (
          <p className="text-xs text-red-600">{fieldErrors.description}</p>
        )}
      </div>

      {LIST_SECTIONS.map(({ key, label, required }) => (
        <ListSection
          key={key}
          title={label}
          required={required}
          items={(formData[key] as string[]) ?? []}
          onChange={(items) => updateFormData({ [key]: items })}
          error={fieldErrors[key]}
        />
      ))}

      <AIDescriptionModal
        open={showModal}
        loading={loading}
        error={error}
        description={result?.description ?? ""}
        onClose={handleClose}
        onRegenerate={handleRegenerate}
        onUse={handleUse}
      />
    </>
  );
}