"use client";

import { useState } from "react";
import { Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useGenerateDescription } from "@/hooks/useGenerateDescription";
import { JobDescriptionInput } from "@/stores/api/job-description.api";
import type { JobFormData } from "@/Interface/job.types";
import { Input } from "@/components/ui/input";
import { AIDescriptionModal } from "./job-description/ai-modal";

interface ParsedDescription {
  summary: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
  experience: string[];
  workingConditions: string[];
  whyJoinUs: string[];
}

function parseAIDescription(text: string): ParsedDescription {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const extract = (heading: RegExp): string[] => {
    const start = lines.findIndex((l) => heading.test(l));
    if (start === -1) return [];
    const items: string[] = [];
    for (let i = start + 1; i < lines.length; i++) {
      // Stop at next heading (line that ends with : or is ALL CAPS)
      if (/^[A-Z][^a-z]{3,}$/.test(lines[i]) || lines[i].endsWith(":")) break;
      const clean = lines[i].replace(/^[-•*]\s*/, "").trim();
      if (clean) items.push(clean);
    }
    return items;
  };

  const summaryEnd = lines.findIndex((l) =>
    /responsibilities|requirements|skills|experience/i.test(l)
  );
  const summary = lines
    .slice(0, summaryEnd > 0 ? summaryEnd : 3)
    .join(" ")
    .trim();

  return {
    summary,
    keyResponsibilities: extract(/responsibilities/i),
    requiredSkills:      extract(/skills|requirements/i),
    experience:          extract(/experience/i),
    workingConditions:   extract(/working conditions/i),
    whyJoinUs:           extract(/why join/i),
  };
}
interface JobDescriptionProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
}

// ── Section config — use the correct field keys ───────────────────────────
const LIST_SECTIONS: {
  key: keyof JobFormData;
  label: string;
  required?: boolean;
}[] = [
  { key: "responsibilities", label: "Key Responsibilities", required: true },
  { key: "required_skills",      label: "Required Skill",       required: true },
  { key: "experienceList",      label: "Experience"                           }, // ✅ not experience
  { key: "workingConditions",   label: "Working Conditions"                   },
  { key: "whyJoinUs",           label: "Why Join Us?"                         },
];

// ── Inline editable list section ─────────────────────────────────────────────
// ── Inline editable list section — styled like QuestionsTopic ────────────────
function ListSection({
  title,
  required,
  items,
  onChange,
}: {
  title: string;
  required?: boolean;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  // Always maintain exactly 4 rows — pad with empty strings if needed
  const normalized = [...items, "", "", "", ""].slice(0, Math.max(4, items.length));

  const handleUpdate = (index: number, value: string) => {
    const next = [...normalized];
    next[index] = value;
    onChange(next);
  };

  const handleDelete = (index: number) => {
    const next = normalized.filter((_, i) => i !== index);
    // Re-pad to 4 if we go below
    while (next.length < 4) next.push("");
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...normalized, ""]);
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          {title}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </h3>
        <Button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-orange-600 text-white text-xs font-semibold px-3 h-8 rounded-md shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add More
        </Button>
      </div>

      {/* Rows */}
      <div className="space-y-4 w-full">
        {normalized.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            {/* Always-visible input — no index label */}
            <Input
              value={item}
              onChange={(e) => handleUpdate(index, e.target.value)}
              placeholder="Lorem ipsum dolor sit amet consectetur adipiscing elit..."
              className="flex-1 h-11 border-gray-200 focus:border-[#F4781B] focus:ring-[#F4781B] rounded-xl"
            />

            {/* Pencil icon — green */}
            <button
              type="button"
              className="text-green-500 hover:text-green-600 p-1 hover:bg-green-50 rounded transition-colors flex-shrink-0"
              aria-label="Edit item"
            >
              <Pencil className="w-5 h-5" />
            </button>

            {/* Delete icon — red */}
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
    </div>
  );
}
// ── Main component ────────────────────────────────────────────────────────────
export function JobDescription({ formData, updateFormData }: JobDescriptionProps) {
  const [showModal, setShowModal] = useState(false);
  const { description, loading, error, generateDescription, reset } = useGenerateDescription();

  const handleClose = () => {
    if (description && !formData.description?.trim()) {
      updateFormData({ description });
    }
    setShowModal(false);
    reset();
  };

  const handleGenerateWithAI = async () => {
    if (!formData.jobTitle || !formData.department) {
      alert("Please fill in Job Title and Department before generating with AI");
      return;
    }

    setShowModal(true);

    let jobType = formData.jobType?.toLowerCase().replace(/\s+/g, "");
    if (jobType === "fulltime") jobType = "Full Time";
    else if (jobType === "parttime") jobType = "Part Time";
    else jobType = formData.jobType || "Full Time";

    const input: JobDescriptionInput = {
      jobTitle: formData.jobTitle,
      department: formData.department,
      jobType,
      location: formData.location || undefined,
      payRange: `$${formData.payRange[0]} - $${formData.payRange[1]}`,
      experienceRequired: formData.experience || undefined,
      qualification: formData.qualification?.join(", ") || undefined,
      specialization: formData.specialization?.join(", ") || undefined,
      urgency: formData.urgency || undefined,
      inPersonInterview: formData.inPersonInterview === "Yes",
      physicalInterview: formData.physicalInterview === "Yes",
    };

    await generateDescription(input);
  };

  const handleUse = () => {
    if (!description) return;

    const parsed = parseAIDescription(description);

    updateFormData({
      description: parsed.summary,
      responsibilities: parsed.keyResponsibilities,
      required_skills: parsed.requiredSkills,
      experienceList: parsed.experience,
      workingConditions: parsed.workingConditions,
      whyJoinUs: parsed.whyJoinUs,
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
      </div>

      {LIST_SECTIONS.map(({ key, label, required }) => (
        <ListSection
          key={key}
          title={label}
          required={required}
          items={(formData[key] as string[]) ?? []}
          onChange={(items) => updateFormData({ [key]: items })}
        />
      ))}

      <AIDescriptionModal
        open={showModal}
        loading={loading}
        error={error}
        description={description}
        onClose={handleClose}
        onRegenerate={handleRegenerate}
        onUse={handleUse}
      />
    </>
  );
}