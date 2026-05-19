"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  generateJobDescriptionFromUi,
  type JobDescriptionInput,
} from "@/features/jobs";
import type { JobFormData } from "@/types";
import { CreateJobListSection } from "../components/listSection";
import { normalizeStringArray } from "./utils";

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
  { key: "required_skills", label: "Required Skill", required: true },
  { key: "experience", label: "Experience" },
  { key: "working_conditions", label: "Working Conditions" },
  { key: "why_join", label: "Why Join Us?" },
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateFormDataRef = useRef(updateFormData);
  const requestedDescriptionKeyRef = useRef<string | null>(null);
  const listSections = hideExperienceList
    ? LIST_SECTIONS.filter((section) => section.key !== "experience")
    : LIST_SECTIONS;

  const hasDescriptionContent = useMemo(
    () =>
      Boolean(formData.description?.trim()) ||
      hasFilledItem(normalizeStringArray(formData.responsibilities)) ||
      hasFilledItem(normalizeStringArray(formData.required_skills)) ||
      hasFilledItem(normalizeStringArray(formData.experience)) ||
      hasFilledItem(normalizeStringArray(formData.working_conditions)) ||
      hasFilledItem(normalizeStringArray(formData.why_join)),
    [
      formData.description,
      formData.responsibilities,
      formData.required_skills,
      formData.experience,
      formData.working_conditions,
      formData.why_join,
    ],
  );

  useEffect(() => {
    updateFormDataRef.current = updateFormData;
  }, [updateFormData]);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const generateDescription = useCallback(async (input: JobDescriptionInput) => {
    setLoading(true);
    setError(null);

    try {
      return await generateJobDescriptionFromUi(input);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate description",
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateAndMapDescription = useCallback(async () => {
    if (!formData.job_title) return;

    const requestKey = [
      formData.job_title,
      formData.department || "",
      formData.job_type || "",
    ].join("|");

    if (requestedDescriptionKeyRef.current === requestKey) {
      return;
    }

    requestedDescriptionKeyRef.current = requestKey;
    reset();

    const input: JobDescriptionInput = {
      jobTitle: formData.job_title,
      department: formData.department || "",
      jobType: formData.job_type || "full_time",
    };

    const generatedDescription = await generateDescription(input);

    if (!generatedDescription) return;

    updateFormDataRef.current({
      description: generatedDescription.description,
      responsibilities: withEmptyRow(generatedDescription.responsibilities),
      required_skills: withEmptyRow(generatedDescription.required_skills),
      experience: withEmptyRow(generatedDescription.experience),
      working_conditions: withEmptyRow(
        generatedDescription.working_conditions,
      ),
      why_join: withEmptyRow(generatedDescription.why_join),
    });
  }, [
    formData.department,
    formData.job_title,
    formData.job_type,
    generateDescription,
    reset,
  ]);

  useEffect(() => {
    if (hasDescriptionContent) return;

    void generateAndMapDescription();
  }, [generateAndMapDescription, hasDescriptionContent]);

  const wantsInterview =
    formData.inPersonInterview === "Yes" ||
    formData.inPersonInterview === true;

  return (
    <>
      {/* Job Summary */}
      <div className="mb-8 space-y-2 sm:space-y-3">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <Label
            htmlFor="description"
            className="text-sm font-medium text-gray-700"
          >
            Job Summary <span className="text-red-500">*</span>
          </Label>
          {loading && (
            <span className="flex items-center gap-1.5 text-xs text-[#F4781B]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating description with KeRaeva&apos;s AI...
            </span>
          )}
        </div>

        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Enter job description..."
          className="min-h-[120px] w-full resize-none text-sm sm:min-h-[140px]"
          rows={5}
        />
        {fieldErrors.description && (
          <p className="text-xs text-red-600">{fieldErrors.description}</p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      {/* Always-present list sections up to 'Why Join Us' */}
      {listSections.map(({ key, label, required }) => (
        <CreateJobListSection
          key={key}
          title={label}
          required={required}
          items={normalizeStringArray(formData[key])}
          onChange={(items) =>
            updateFormData({ [key]: items } as Partial<JobFormData>)
          }
          error={fieldErrors[key]}
        />
      ))}

    </>
  );
}