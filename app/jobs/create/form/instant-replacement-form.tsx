"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobsStore } from "@/stores/jobs-store";
import { JobCreatePayload, JobFormData } from "@/Interface/job.types";
import { JobForm } from "../../components/JobForm";
import { InstantJobFields } from "../../instant-replacement/components/instant-job-fields";
import { convertJobTitleToBackend } from "@/utils/constant/metadata";
import { SuccessModal } from "@/components/modal";

interface Props {
  urgencyMode: "instant";
  onNext?: (payload: JobCreatePayload) => void;
  onBack?: () => void;
}

interface InstantJobFormData extends JobFormData {
  numberOfHires?: string;
  amountPerHire?: string;
  fromDate?: Date;
  tillDate?: Date;
  neighborhoodName?: string;
  neighborhoodType?: string;
  directNumber?: string;
  streetAddress?: string;
  postalCode?: string;
  province?: string;
  city?: string;
  country?: string;
}

const formatDateForBackend = (date?: Date): string | null => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function InstantReplacementForm({ onBack, onNext }: Props) {
  const router = useRouter();
  const createJob = useJobsStore((state) => state.createJob);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<InstantJobFormData>({
    jobTitle: "",
    department: "",
    jobType: "Full Time",
    location: "",
    payRange: [0, 0] as [number, number],
    experience: "",
    qualification: [],
    specialization: [],
    urgency: "instant",
    inPersonInterview: "Yes",
    physicalInterview: "Yes",
    description: "",
    status: "DRAFT",
    numberOfHires: "",
    amountPerHire: "",
    fromDate: undefined,
    tillDate: undefined,
    fromTime: "08:00",
    toTime:   "16:00",
    neighborhoodName: "",
    neighborhoodType: "",
    directNumber: "",
    streetAddress: "",
    postalCode: "",
    province: "ontario",
    city: "",
    country: "Canada",
  });

  const updateFormData = (updates: Partial<InstantJobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.fromDate || !formData.tillDate) {
    setError("Shift Start Date and Shift End Date are required");
    return;
  }

  const fromDay = new Date(formData.fromDate).setHours(0, 0, 0, 0);
  const tillDay = new Date(formData.tillDate).setHours(0, 0, 0, 0);
  if (tillDay < fromDay) {
    setError("Shift End Date cannot be before Shift Start Date");
    return;
  }

  const inTime  = formData.fromTime;
  const outTime = formData.toTime;
  if (inTime && outTime) {
    const [h1, m1] = inTime.split(":").map(Number);
    const [h2, m2] = outTime.split(":").map(Number);
    let diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diffMins < 0) diffMins += 24 * 60; // handles overnight e.g. 20:00 → 02:00
    if (diffMins / 60 < 3 || diffMins / 60 > 12) {
      setError("Shift duration must be between 3 and 12 hours");
      return;
    }
  }

  setIsSubmitting(true);
  setError(null);

  const backendData: JobCreatePayload = {
    job_title:           convertJobTitleToBackend(formData.jobTitle),
    job_type:            "casual",
    department:          formData.department || null,
    street:              formData.streetAddress || null,
    postal_code:         formData.postalCode || null,
    province:            formData.province || null,
    city:                formData.city || null,
    neighborhood_name:   formData.neighborhoodName || null,
    neighborhood_type:   formData.neighborhoodType || null,
    direct_number:       formData.directNumber || null,
    pay_range_min:       Number(formData.amountPerHire?.replace(/\D/g, "")) || null,
    pay_range_max:       Number(formData.amountPerHire?.replace(/\D/g, "")) || null,
    years_of_experience: null,
    qualifications:      null,
    specializations:     null,
    job_urgency:         "instant",
    ai_interview:        false,
    description:         formData.description || null,
    questions:           null,
    status:              "DRAFT",
    no_of_hires:         formData.numberOfHires ? parseInt(formData.numberOfHires) : null,
    start_date:          formatDateForBackend(formData.fromDate),
    end_date:            formatDateForBackend(formData.tillDate),
    check_in_time:  formData.fromTime ?? null,
    check_out_time: formData.toTime   ?? null,
  };

  if (onNext) {
    // ✅ Go to summary page — don't submit yet
    setIsSubmitting(false);
    onNext(backendData);
    return;
  }

  // Fallback — direct submit if no summary step
  try {
    const response = await createJob(backendData);
    if (response.success) {
      sessionStorage.setItem("createdJobId", response.data.id);
      setShowSuccessModal(true);
    } else {
      setError(response.message || "Failed to create instant replacement");
    }
  } catch (err) {
    setError((err as Error).message || "An error occurred");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <>
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/jobs");
        }}
        title="Job Posted!"
        message="Your instant job post has been created successfully."
        buttonText="Done"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <JobForm
        mode="create"
        title="Request Immediate Staff"
        formData={formData}
        updateFormData={updateFormData}
        onSubmit={handleSubmit}
        onBack={onBack}
        showBackButton={!!onBack}
        showNextButton={!isSubmitting}
        nextLabel={isSubmitting ? "Submitting..." : "Submit Request"}
        hideRequirements={true}
        hideInterviewSettings={true}
        customSections={
          <InstantJobFields
            formData={formData}
            updateFormData={updateFormData}
          />
        }
      />
    </>
  );
}