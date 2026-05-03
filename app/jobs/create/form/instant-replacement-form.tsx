"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useJobsStore } from "@/stores/jobs-store";
import type { JobFormSnapshot } from "@/stores/jobs-store";
import { InstantJobFormData, JobCreatePayload, Province } from "@/Interface/recruiter.types";
import { JobForm } from "../../components/JobForm";
import { InstantJobFields } from "../../instant-replacement/components/instant-job-fields";
import { SuccessModal } from "@/components/modal";
import { axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";

interface Props {
  urgencyMode: "instant";
  onNext?: (payload: JobCreatePayload) => void;
  onBack?: () => void;
}

const formatDateForBackend = (date?: Date): string | undefined => {
  if (!date) return undefined;
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day   = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DEFAULT_INSTANT_FORM: InstantJobFormData = {
  jobTitle:          "",
  department:        "",
  jobType:           "Full Time",
  location:          "",
  payRange:          [0, 0],
  experience:        "",
  qualification:     [],
  specialization:    [],
  urgency:           "instant",
  inPersonInterview: "Yes",
  physicalInterview: "Yes",
  description:       "",
  responsibilities:  [],
  required_skills:   [],
  status:            "DRAFT",
  numberOfHires:     "",
  amountPerHire:     "",
  fromDate:          undefined,
  tillDate:          undefined,
  fromTime:          "08:00",
  toTime:            "16:00",
  neighborhoodName:  "",
  neighborhoodType:  "",
  directNumber:      "",
  streetAddress:     "",
  postalCode:        "",
  province:          "ontario" as Province,
  city:              "",
  country:           "Canada",
};

// ✅ Pure function — no side effects, safe inside useState initializer
function buildInitialInstantForm(snapshot: JobFormSnapshot | null): InstantJobFormData {
  if (!snapshot) return DEFAULT_INSTANT_FORM;
  return {
    ...DEFAULT_INSTANT_FORM,
    jobTitle:         (snapshot.jobTitle         as string)           ?? DEFAULT_INSTANT_FORM.jobTitle,
    department:       (snapshot.department       as string)           ?? DEFAULT_INSTANT_FORM.department,
    description:      (snapshot.description      as string)           ?? DEFAULT_INSTANT_FORM.description,
    numberOfHires:    (snapshot.numberOfHires    as string)           ?? DEFAULT_INSTANT_FORM.numberOfHires,
    fromTime:         (snapshot.fromTime         as string)           ?? DEFAULT_INSTANT_FORM.fromTime,
    toTime:           (snapshot.toTime           as string)           ?? DEFAULT_INSTANT_FORM.toTime,
    streetAddress:    (snapshot.streetAddress    as string)           ?? DEFAULT_INSTANT_FORM.streetAddress,
    postalCode:       (snapshot.postalCode       as string)           ?? DEFAULT_INSTANT_FORM.postalCode,
    province:         (snapshot.province         as Province)         ?? DEFAULT_INSTANT_FORM.province,
    city:             (snapshot.city             as string)           ?? DEFAULT_INSTANT_FORM.city,
    neighborhoodName: (snapshot.neighborhoodName as string)           ?? DEFAULT_INSTANT_FORM.neighborhoodName,
    neighborhoodType: (snapshot.neighborhoodType as string)           ?? DEFAULT_INSTANT_FORM.neighborhoodType,
    directNumber:     (snapshot.directNumber     as string)           ?? DEFAULT_INSTANT_FORM.directNumber,
    payRange:         (snapshot.payRange         as [number, number]) ?? DEFAULT_INSTANT_FORM.payRange,
    responsibilities: (snapshot.responsibilities as string[])         ?? DEFAULT_INSTANT_FORM.responsibilities,
    required_skills:  (snapshot.required_skills  as string[])         ?? DEFAULT_INSTANT_FORM.required_skills,
    // ✅ amountPerHire intentionally excluded — always fetched fresh from backend
    fromDate: snapshot.fromDate ? new Date(snapshot.fromDate as string) : undefined,
    tillDate: snapshot.tillDate ? new Date(snapshot.tillDate as string) : undefined,
  };
}

export function InstantReplacementForm({ onBack, onNext }: Props) {
  const router          = useRouter();
  const createJob       = useJobsStore((state) => state.createJob);
  const setFormSnapshot = useJobsStore((s) => s.setFormSnapshot);
  const formSnapshot    = useJobsStore((s) => s.formSnapshot);

  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [error, setError]                       = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ✅ Backend-fetched pay rate — readonly, never in formData
  const [payRateCents, setPayRateCents]         = useState<number | null>(
    (formSnapshot?.cachedPayRateCents as number) ?? null
  );
  const [payRateLoading, setPayRateLoading]     = useState(false);
  const [payRateError, setPayRateError]         = useState<string | null>(null);

  // ✅ Pure initializer — no store writes during render
  const [formData, setFormData] = useState<InstantJobFormData>(() =>
    buildInitialInstantForm(formSnapshot)
  );

  // ✅ Fetch pay rate whenever jobTitle changes
  useEffect(() => {
    if (!formData.jobTitle) {
      setPayRateCents(null);
      setPayRateError(null);
      return;
    }

    setPayRateLoading(true);
    setPayRateError(null);

    axiosInstance
      .get(ENDPOINTS.JOBS_FEES(formData.jobTitle))
      .then((res) => {
  console.log("💰 JOBS_FEES raw response:", JSON.stringify(res.data, null, 2));

  // ✅ Field is recruiter_pay_per_hour in dollars — convert to cents
  const dollars: number =
    res.data?.data?.recruiter_pay_per_hour ??
    res.data?.recruiter_pay_per_hour ??
    0;

  const cents = Math.round(dollars * 100);

  console.log("💰 cents extracted:", cents);
  setPayRateCents(cents);

  const currentSnapshot = useJobsStore.getState().formSnapshot;
  setFormSnapshot({
    ...(currentSnapshot ?? {}),
    cachedPayRateCents: cents,
  } as JobFormSnapshot);
})
      .catch(() => setPayRateError("Could not load pay rate for this role"))
      .finally(() => setPayRateLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.jobTitle]);

  const updateFormData = (updates: Partial<InstantJobFormData>) => {
    // ✅ Step 1: pure React state update
    setFormData((prev) => ({ ...prev, ...updates }));

    // ✅ Step 2: sync to Zustand imperatively — no side effect inside setState updater
    const currentSnapshot = useJobsStore.getState().formSnapshot;
    const nextSnapshot: JobFormSnapshot = {
      ...(currentSnapshot ?? {}),
      ...updates,
      fromDate: updates.fromDate instanceof Date
        ? updates.fromDate.toISOString()
        : (updates.fromDate !== undefined ? (updates.fromDate as string) : currentSnapshot?.fromDate),
      tillDate: updates.tillDate instanceof Date
        ? updates.tillDate.toISOString()
        : (updates.tillDate !== undefined ? (updates.tillDate as string) : currentSnapshot?.tillDate),
    } as JobFormSnapshot;

    setFormSnapshot(nextSnapshot);
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

    const jobTitleLabel = (formData.jobTitle ?? "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const backendData: JobCreatePayload = {
      job_title:            formData.jobTitle ?? "",
      status:               "DRAFT",
      job_type:             "casual",
      job_urgency:          "instant",
      department:           formData.department       || undefined,
      street:               formData.streetAddress    || undefined,
      postal_code:          formData.postalCode       || undefined,
      province:             formData.province         || undefined,
      city:                 formData.city             || undefined,
      neighborhood_name:    formData.neighborhoodName || undefined,
      neighborhood_type:    formData.neighborhoodType || undefined,
      direct_number:        formData.directNumber     || undefined,
      // ✅ Always use backend-fetched rate — never trust user input
      pay_per_hour_cents:   payRateCents ?? 0,
      years_of_experience:  undefined,
      qualifications:       undefined,
      specializations:      undefined,
      ai_interview:         false,
      questions:            undefined,
      description:          formData.description      || undefined,
      no_of_hires_required: formData.numberOfHires
                              ? parseInt(formData.numberOfHires)
                              : undefined,
      start_date:           formatDateForBackend(formData.fromDate),
      end_date:             formatDateForBackend(formData.tillDate),
      check_in_time:        formData.fromTime || undefined,
      check_out_time:       formData.toTime   || undefined,
      responsibilities: formData.responsibilities?.filter(Boolean).length
        ? formData.responsibilities.filter(Boolean)
        : [`Provide ${jobTitleLabel} duties as assigned`],
      required_skills: formData.required_skills?.filter(Boolean).length
        ? formData.required_skills.filter(Boolean)
        : [`Valid ${jobTitleLabel} license or certification`],
      experience: formData.experienceList?.filter(Boolean).length
        ? formData.experienceList.filter(Boolean)
        : ["Relevant clinical experience required"],
      working_conditions: formData.workingConditions?.filter(Boolean).length
        ? formData.workingConditions.filter(Boolean)
        : ["Standard healthcare facility environment"],
      why_join: formData.whyJoin?.filter(Boolean).length
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
    payRateCents={payRateCents}        // ✅ pass backend value
    payRateLoading={payRateLoading}    // ✅ pass loading state
    payRateError={payRateError}        // ✅ pass error state
  />
}
      />
    </>
  );
}