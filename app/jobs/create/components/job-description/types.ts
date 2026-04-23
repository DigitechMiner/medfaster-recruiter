import type { JobFormData } from "@/Interface/job.types";

export interface JobDescriptionProps {
  formData: JobFormData;
  updateFormData: (updates: Partial<JobFormData>) => void;
}

export interface ListSectionConfig {
  key: keyof JobFormData;
  label: string;
  required?: boolean;
}

export interface ParsedAIDescription {
  summary: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
  experience: string[];
  workingConditions: string[];
  whyJoinUs: string[];
}

export const LIST_SECTIONS: ListSectionConfig[] = [
  { key: "responsibilities", label: "Key Responsibilities", required: true },
  { key: "required_skills", label: "Required Skill", required: true },
  { key: "experienceList", label: "Experience" },
  { key: "workingConditions", label: "Working Conditions" },
  { key: "whyJoinUs", label: "Why Join Us?" },
];
