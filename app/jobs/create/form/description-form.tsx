"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JobDescriptionInput } from "@/features/jobs";
import { useGenerateDescription } from "@/hooks/useGenerateDescription";
import type { JobFormData } from "@/types";
import { CreateJobListSection } from "./create-job-list-section";

interface DescriptionFormProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
  fieldErrors?: Partial<Record<keyof JobFormData, string>>;
  hideExperienceList?: boolean;
}

interface ListSectionConfig {
  key: keyof JobFormData;
  label: string;
  required?: boolean;
}

const LIST_SECTIONS: ListSectionConfig[] = [
  { key: "responsibilities", label: "Key Responsibilities", required: true },
  { key: "required_skills", label: "Required Skills", required: true },
  { key: "experienceList", label: "Experience" },
  { key: "workingConditions", label: "Working Conditions" },
  { key: "whyJoin", label: "Why Join Us?" },
];

const withEmptyRow = (items?: string[]) =>
  items && items.length > 0 ? items : [""];

const hasFilledItem = (items?: string[]) =>
  items?.some((item) => item.trim().length > 0) ?? false;

export function DescriptionForm({
  formData,
  updateFormData,
  fieldErrors = {},
  hideExperienceList = false,
}: DescriptionFormProps) {
  const updateFormDataRef = useRef(updateFormData);
  const requestedDescriptionKeyRef = useRef<string | null>(null);
  const { loading, error, generateDescription, reset } =
    useGenerateDescription();
  const listSections = hideExperienceList
    ? LIST_SECTIONS.filter((section) => section.key !== "experienceList")
    : LIST_SECTIONS;

  const hasDescriptionContent = useMemo(
    () =>
      Boolean(formData.description?.trim()) ||
      hasFilledItem(formData.responsibilities) ||
      hasFilledItem(formData.required_skills) ||
      hasFilledItem(formData.experienceList) ||
      hasFilledItem(formData.workingConditions) ||
      hasFilledItem(formData.whyJoin),
    [
      formData.description,
      formData.responsibilities,
      formData.required_skills,
      formData.experienceList,
      formData.workingConditions,
      formData.whyJoin,
    ],
  );

  useEffect(() => {
    updateFormDataRef.current = updateFormData;
  }, [updateFormData]);

  const generateAndMapDescription = useCallback(async () => {
    if (!formData.jobTitle) return;

    const requestKey = [
      formData.jobTitle,
      formData.department || "",
      formData.jobType || "",
    ].join("|");

    if (requestedDescriptionKeyRef.current === requestKey) {
      return;
    }

    requestedDescriptionKeyRef.current = requestKey;
    reset();

    const input: JobDescriptionInput = {
      jobTitle: formData.jobTitle,
      department: formData.department || "",
      jobType: formData.jobType || "Full Time",
    };

    const generatedDescription = await generateDescription(input);

    if (!generatedDescription) return;

    updateFormDataRef.current({
      description: generatedDescription.description,
      responsibilities: withEmptyRow(generatedDescription.responsibilities),
      required_skills: withEmptyRow(generatedDescription.required_skills),
      experienceList: withEmptyRow(generatedDescription.experience),
      workingConditions: withEmptyRow(generatedDescription.working_conditions),
      whyJoin: withEmptyRow(generatedDescription.why_join),
    });
  }, [
    formData.department,
    formData.jobTitle,
    formData.jobType,
    generateDescription,
    reset,
  ]);

  useEffect(() => {
    if (hasDescriptionContent) return;

    void generateAndMapDescription();
  }, [generateAndMapDescription, hasDescriptionContent]);

  return (
    <>
      <div className="space-y-2 sm:space-y-3 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <Label
            htmlFor="description"
            className="text-sm font-medium text-gray-700"
          >
            Job Summary <span className="text-red-500">*</span>
          </Label>
          {loading && (
            <span className="flex items-center gap-1.5 text-xs text-[#F4781B]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating description...
            </span>
          )}
        </div>

        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Enter job description..."
          className="w-full min-h-[120px] sm:min-h-[140px] resize-none text-sm"
          rows={5}
        />
        {fieldErrors.description && (
          <p className="text-xs text-red-600">{fieldErrors.description}</p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      {listSections.map(({ key, label, required }) => (
        <CreateJobListSection
          key={key}
          title={label}
          required={required}
          items={(formData[key] as string[]) ?? []}
          onChange={(items) =>
            updateFormData({ [key]: items } as Partial<JobFormData>)
          }
          error={fieldErrors[key]}
        />
      ))}
    </>
  );
}
