"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobsStore } from "@/stores/jobs-store";
import { JobCreatePayload, JobFormData, JobUpdatePayload } from "@/Interface/job.types";
import { JobForm } from "../../components/JobForm";
import { InstantJobFields } from "../../instant-replacement/components/instant-job-fields";
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

const formatDateForBackend = (date?: Date): string | undefined => {
  if (!date) return undefined;
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
    if (diffMins < 0) diffMins += 24 * 60;
    if (diffMins / 60 < 3 || diffMins / 60 > 12) {
      setError("Shift duration must be between 3 and 12 hours");
      return;
    }
  }

  setIsSubmitting(true);
  setError(null);

  const rawAmount = Number(formData.amountPerHire?.replace(/\D/g, "") ?? "0");
  const jobTitleLabel = (formData.jobTitle ?? "")
  .replace(/_/g, " ")
  .replace(/\b\w/g, (c) => c.toUpperCase());
  
  const backendData: JobCreatePayload = {
    // ✅ Already a slug from the store — NO conversion needed
    job_title:         formData.jobTitle ?? "",
    status:            "DRAFT",
    job_type:          "casual",
    job_urgency:       "instant",
    department:        formData.department       || undefined,
    street:            formData.streetAddress    || undefined,
    postal_code:       formData.postalCode       || undefined,
    province:          formData.province         || undefined,
    city:              formData.city             || undefined,
    neighborhood_name: formData.neighborhoodName || undefined,
    neighborhood_type: formData.neighborhoodType || undefined,
    direct_number:     formData.directNumber     || undefined,
    pay_per_hour_cents: rawAmount ? (Math.round(rawAmount * 100)) : undefined,
    years_of_experience: undefined,
    qualifications:    undefined,
    specializations:   undefined,
    ai_interview:      false,
    questions:         undefined,
    description:       formData.description      || undefined,
    no_of_hires_required: formData.numberOfHires
                            ? parseInt(formData.numberOfHires)
                            : undefined,
    start_date:        formatDateForBackend(formData.fromDate),
    end_date:          formatDateForBackend(formData.tillDate),
    check_in_time:     formData.fromTime || undefined,
    check_out_time:    formData.toTime   || undefined,

    // ✅ Required by backend for all job types — send empty arrays for instant jobs
     responsibilities:   formData.responsibilities?.filter(Boolean).length
                        ? formData.responsibilities.filter(Boolean)
                        : [`Provide ${jobTitleLabel} duties as assigned`],

  required_skills:    formData.required_skills?.filter(Boolean).length
                        ? formData.required_skills.filter(Boolean)
                        : [`Valid ${jobTitleLabel} license or certification`],

  experience:         formData.experienceList?.filter(Boolean).length
                        ? formData.experienceList.filter(Boolean)
                        : ["Relevant clinical experience required"],

  working_conditions: formData.workingConditions?.filter(Boolean).length
                        ? formData.workingConditions.filter(Boolean)
                        : ["Standard healthcare facility environment"],

  why_join:        formData.whyJoin?.filter(Boolean).length
                        ? formData.whyJoin.filter(Boolean)
                        : ["Competitive hourly pay"],
};

  if (onNext) {
    setIsSubmitting(false);
    onNext(backendData);
    return;
  }

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