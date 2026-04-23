"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useGenerateDescription } from "@/hooks/useGenerateDescription";
import { JobDescriptionInput } from "@/stores/api/job-description.api";
import { AIDescriptionModal } from "./job-description/ai-modal";
import { ListSection } from "./job-description/list-section";
import { parseAIDescription } from "./job-description/parser";
import { JobDescriptionProps, LIST_SECTIONS } from "./job-description/types";

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