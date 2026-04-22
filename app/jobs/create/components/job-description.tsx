"use client";

import { useState } from "react";
import { Sparkles, X, Check, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGenerateDescription } from "@/hooks/useGenerateDescription";
import { JobDescriptionInput } from "@/stores/api/job-description.api";
import type { JobFormData } from "@/Interface/job.types";

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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue]       = useState("");

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(items[index]);
  };

  const confirmEdit = (index: number) => {
    if (!editValue.trim()) return;
    const next = [...items];
    next[index] = editValue.trim();
    onChange(next);
    setEditingIndex(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    // Remove item if it was newly added and still empty
    if (items[editingIndex!] === "") {
      onChange(items.filter((_, i) => i !== editingIndex));
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const handleAdd = () => {
    const next = [...items, ""];
    onChange(next);
    setEditingIndex(next.length - 1);
    setEditValue("");
  };

  const handleDelete = (index: number) => {
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditValue("");
    }
    onChange(items.filter((_, i) => i !== index));
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
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-white group hover:border-gray-300 transition-colors"
          >
            {editingIndex === index ? (
              <>
                <Input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmEdit(index);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="flex-1 h-7 border-none shadow-none p-0 text-sm focus-visible:ring-0"
                  placeholder="Enter text..."
                />
                <button
                  type="button"
                  onClick={() => confirmEdit(index)}
                  className="text-green-500 hover:text-green-600 flex-shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-700 truncate">
                  {item || <span className="text-gray-300 italic">Empty — click edit to fill</span>}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(index)}
                  className="text-[#F4781B] hover:text-orange-600 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-xs text-gray-400 italic px-1">
            No items yet — click &quot;Add More&quot; or generate with AI above.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function JobDescription({ formData, updateFormData }: JobDescriptionProps) {
  const [showModal, setShowModal] = useState(false);
  const { description, loading, error, generateDescription, reset } = useGenerateDescription();

  const handleGenerateWithAI = async () => {
    if (!formData.jobTitle || !formData.department) {
      alert("Please fill in Job Title and Department before generating with AI");
      return;
    }

    setShowModal(true);

    let jobType = formData.jobType?.toLowerCase().replace(/\s+/g, "");
    if (jobType === "fulltime")      jobType = "Full Time";
    else if (jobType === "parttime") jobType = "Part Time";
    else                             jobType = formData.jobType || "Full Time";

    const input: JobDescriptionInput = {
      jobTitle:           formData.jobTitle,
      department:         formData.department,
      jobType:            jobType,
      location:           formData.location || undefined,
      payRange:           `$${formData.payRange[0]} - $${formData.payRange[1]}`,
      experienceRequired: formData.experience || undefined,
      qualification:      formData.qualification?.join(", ") || undefined,
      specialization:     formData.specialization?.join(", ") || undefined,
      urgency:            formData.urgency || undefined,
      inPersonInterview:  formData.inPersonInterview === "Yes",
      physicalInterview:  formData.physicalInterview === "Yes",
    };

    await generateDescription(input);
  };
// ── handleUse — map to correct keys ──────────────────────────────────────
const handleUse = () => {
  if (!description) return;

  const parsed = parseAIDescription(description);

  updateFormData({
    description:          parsed.summary,
    responsibilities:  parsed.keyResponsibilities,
    required_skills:       parsed.requiredSkills,
    experienceList:       parsed.experience,   // ✅ string[] goes to experienceList, not experience
    workingConditions:    parsed.workingConditions,
    whyJoinUs:            parsed.whyJoinUs,
  });

  handleClose();
};

  const handleClose = () => {
    if (description && !formData.description?.trim()) {
      updateFormData({ description });
    }
    setShowModal(false);
    reset();
  };

  const handleRegenerate = async () => {
    reset();
    await handleGenerateWithAI();
  };

  return (
    <>
      {/* ── Description textarea ── */}
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

      {/* ── List sections ── */}
      {LIST_SECTIONS.map(({ key, label, required }) => (
        <ListSection
          key={key}
          title={label}
          required={required}
          items={(formData[key] as string[]) ?? []}
          onChange={(items) => updateFormData({ [key]: items })}
        />
      ))}

      {/* ── AI Generator Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F4781B]" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  AI Generated Description
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-[#F4781B] animate-spin mb-4" />
                  <p className="text-gray-600 text-center">
                    Generating job description with AI...
                  </p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                  <Button
                    onClick={handleRegenerate}
                    variant="ghost"
                    className="mt-3 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {description && !loading && (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                    <p className="text-sm text-orange-800 mb-2 font-medium">
                      ✨ Generated based on your job details — this will also fill in Key
                      Responsibilities, Skills, Experience and more.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                    {description}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {description && !loading && (
              <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-gray-200">
                <Button
                  onClick={handleRegenerate}
                  variant="ghost"
                  className="flex-1 h-10 border-gray-300"
                  disabled={loading}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  onClick={handleUse}
                  className="flex-1 h-10 bg-[#F4781B] hover:bg-orange-600 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Use This Description
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── AI response parser ────────────────────────────────────────────────────────
// Adjust the heading keywords to match whatever your API actually returns.
// This handles both markdown (## Key Responsibilities) and plain text headings.
function parseAIDescription(raw: string) {
  const result = {
    summary:             "",
    keyResponsibilities: [] as string[],
    requiredSkills:      [] as string[],
    experience:          [] as string[],
    workingConditions:   [] as string[],
    whyJoinUs:           [] as string[],
  };

  // Split into lines
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);

  type SectionKey = keyof typeof result;

  const HEADING_MAP: { pattern: RegExp; key: SectionKey }[] = [
    { pattern: /key\s*responsibilities/i,  key: "keyResponsibilities" },
    { pattern: /required\s*skills?/i,      key: "requiredSkills"      },
    { pattern: /experience/i,              key: "experience"          },
    { pattern: /working\s*conditions?/i,   key: "workingConditions"   },
    { pattern: /why\s*join/i,              key: "whyJoinUs"           },
  ];

  let currentSection: SectionKey = "summary";
  const summaryLines: string[]    = [];

  for (const line of lines) {
    // Strip markdown heading markers
    const clean = line.replace(/^#{1,4}\s*/, "").replace(/\*\*/g, "").trim();

    // Check if this line is a section heading
    const matched = HEADING_MAP.find(({ pattern }) => pattern.test(clean));
    if (matched) {
      currentSection = matched.key;
      continue;
    }

    // Strip bullet markers and add to correct section
    const content = clean.replace(/^[-•*]\s*/, "").trim();
    if (!content) continue;

    if (currentSection === "summary") {
      summaryLines.push(content);
    } else {
      (result[currentSection] as string[]).push(content);
    }
  }

  result.summary = summaryLines.join("\n");
  return result;
}