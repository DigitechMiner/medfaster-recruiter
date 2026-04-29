"use client";

import { useState } from "react";
import { Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useGenerateDescription } from "@/hooks/useGenerateDescription";
import { JobDescriptionInput } from "@/stores/api/job-description.api";
import type { JobFormData } from "@/Interface/recruiter.types";
import { Input } from "@/components/ui/input";
import { AIDescriptionModal } from "./job-description/ai-modal";

interface ParsedDescription {
  summary: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
  experience: string[];
  workingConditions: string[];
  whyJoin: string[];
}

function parseAIDescription(text: string): ParsedDescription {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // ✅ Strip markdown: **text**, ## text, ### text, * bullet, - bullet
  const clean = (line: string) =>
    line.replace(/^#{1,4}\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").trim();

  const cleanedLines = lines.map(clean);

  // ✅ Extract bullet items under a heading that matches the regex
  const extract = (heading: RegExp): string[] => {
    const start = cleanedLines.findIndex((l) => heading.test(l));
    if (start === -1) return [];
    const items: string[] = [];
    for (let i = start + 1; i < cleanedLines.length; i++) {
      const raw = cleanedLines[i];
      // Stop at next section heading
      if (
        /^(key responsibilities|required skills?|requirements|experience|working conditions|why join|qualifications?|benefits?|about)/i.test(raw) ||
        lines[i].match(/^#{1,4}\s/) ||   // markdown heading in original
        lines[i].match(/^\*\*[^*]+\*\*:?$/) // **Heading** alone on a line
      ) break;
      // Strip bullet markers: -, *, •, numbered (1. 2.)
      const item = raw.replace(/^[-•*]\s*/, "").replace(/^\d+\.\s*/, "").trim();
      if (item) items.push(item);
    }
    return items;
  };

  // ✅ Summary = everything before first section heading
  const firstSectionIdx = cleanedLines.findIndex((l) =>
    /^(key responsibilities|required skills?|requirements|experience|working conditions|why join|qualifications?)/i.test(l)
  );
  const summary = cleanedLines
    .slice(0, firstSectionIdx > 0 ? firstSectionIdx : 3)
    .filter((l) => !l.match(/^#{1,4}\s/) && l.length > 20) // skip headings, short lines
    .join(" ")
    .trim();

  return {
    summary,
    keyResponsibilities: extract(/key responsibilities|responsibilities/i),
    requiredSkills:      extract(/required skills?|requirements|qualifications?/i),
    experience:          extract(/experience/i),
    workingConditions:   extract(/working conditions|work conditions|environment/i),
    whyJoin:           extract(/why join|benefits?|what we offer/i),
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
  { key: "whyJoin",           label: "Why Join Us?"                         },
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
  const normalized = items.length > 0 ? items : [""];

  const handleUpdate = (index: number, value: string) => {
    const next = [...normalized];
    next[index] = value;
    onChange(next);
  };

  const handleDelete = (index: number) => {
  const next = normalized.filter((_, i) => i !== index);
  // ✅ Keep at least 1 empty row so the section never looks blank
  if (next.length === 0) next.push("");
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

  const input: JobDescriptionInput = {
    jobTitle:           formData.jobTitle,    // ✅ already "registered_nurse" from store
    department:         formData.department,  // ✅ already "nursing"
    jobType:            formData.jobType || "Full Time",
    location:           formData.location || undefined,
    payRange: Array.isArray(formData.payRange)
  ? `$${formData.payRange[0]} - $${formData.payRange[1]}`
  : "$0 - $0",
    experienceRequired: formData.experience || undefined,
    qualification:      formData.qualification?.join(", ") || undefined,
    specialization:     formData.specialization?.join(", ") || undefined,
    urgency:            formData.urgency || undefined,
    inPersonInterview:  formData.inPersonInterview === "Yes",
    physicalInterview:  formData.physicalInterview === "Yes",
  };

  await generateDescription(input);
};

 const handleUse = () => {
  if (!description) return;

  const parsed = parseAIDescription(description);

  // Split summary into sentences as fallback seeds
  const sentences = description
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  updateFormData({
    description:       parsed.summary || description,

    // ✅ Never send empty — seed from summary sentences if AI didn't return sections
    responsibilities:  parsed.keyResponsibilities.length > 0
                         ? parsed.keyResponsibilities
                         : [sentences[0] ?? "Provide clinical care"],

    required_skills:   parsed.requiredSkills.length > 0
                         ? parsed.requiredSkills
                         : [sentences[1] ?? "Valid nursing license"],

    experienceList:    parsed.experience.length > 0
                         ? parsed.experience
                         : ["Relevant clinical experience required"],

    workingConditions: parsed.workingConditions.length > 0
                         ? parsed.workingConditions
                         : ["Standard healthcare facility conditions"],

    whyJoin:         parsed.whyJoin.length > 0
                         ? parsed.whyJoin
                         : ["Competitive compensation and benefits"],
  });

  handleClose();
};

  const handleRegenerate = async () => {
    reset();
    await handleGenerateWithAI();
  };
const isInstant = formData.urgency === "instant";
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

      {LIST_SECTIONS
  .filter(() => !isInstant)   // ← hides all 5 sections for instant jobs
  .map(({ key, label, required }) => (
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