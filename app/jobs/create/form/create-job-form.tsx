"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_JOB_FORM_DATA } from "../../constants/form";
import { BUTTON_LABELS } from "../../constants/messages";
import { JobForm, JobFormData } from "../../components/JobForm";

interface Props {
  onNext?: () => void;
  onBack?: () => void;
}

export function CreateJobForm({ onNext, onBack }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<JobFormData>(DEFAULT_JOB_FORM_DATA);

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNext) onNext();
  };

  const handlePreview = () => {
    router.push("/jobs");
  };

  return (
    <JobForm
      mode="create"
      formData={formData}
      updateFormData={updateFormData}
      onSubmit={handleSubmit}
      onBack={onBack}
      onPreview={handlePreview}
      showBackButton={!!onBack}
      showNextButton={true}
      nextLabel={BUTTON_LABELS.NEXT}
    />
  );
}


