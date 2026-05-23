"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { SuccessModal } from "@/components/modal";
import { axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";
import { useJobsStore, type JobFormSnapshot } from "@/stores/jobs-store";
import type { InstantJobFormData, JobCreatePayload, Province } from "@/types";
import {
  filterValidationErrorsForStep,
  toFormFieldErrors,
  validateJobPayload,
  type CreateFormStep,
  type JobFormFieldErrors,
} from "../validation";
import { DEFAULT_INSTANT_FORM } from "./constant";
import { buildInstantJobCreatePayload } from "./build-instant-payload";
import {
  buildNextFormSnapshot,
  clearErrorsForUpdatedFields,
  dateFromSnapshot,
  formatDateForBackend,
  fromSnapshot,
  normalizeStringArray,
} from "../form/utils";
import { DescriptionForm } from "../form/description-form";
import { InstantBasicStep } from "./instant-basic-step";

interface InstantJobFormProps {
  urgencyMode: "instant";
  onNext?: (payload: JobCreatePayload) => void;
  onStepNext?: () => void;
  formStep?: CreateFormStep;
  formId?: string;
  autoSubmitToken?: number;
  onValidationBlocked?: () => void;
}

const getCachedPayRateCents = (jobTitle: string): number | null => {
  const snapshot = useJobsStore.getState().formSnapshot;
  const cachedPayRate = snapshot?.cachedPayRate;

  if (
    cachedPayRate?.jobTitle === jobTitle &&
    typeof cachedPayRate.cents === "number"
  ) {
    return cachedPayRate.cents;
  }

  return null;
};

function buildInitialInstantForm(
  snapshot: JobFormSnapshot | null,
): InstantJobFormData {
  return {
    ...DEFAULT_INSTANT_FORM,
    job_title: fromSnapshot(
      snapshot,
      "job_title",
      DEFAULT_INSTANT_FORM.job_title,
    ),
    department: fromSnapshot(
      snapshot,
      "department",
      DEFAULT_INSTANT_FORM.department,
    ),
    description: fromSnapshot(
      snapshot,
      "description",
      DEFAULT_INSTANT_FORM.description,
    ),
    no_of_hires_required: fromSnapshot(
      snapshot,
      "no_of_hires_required",
      DEFAULT_INSTANT_FORM.no_of_hires_required,
    ),
    check_in_time: fromSnapshot(
      snapshot,
      "check_in_time",
      DEFAULT_INSTANT_FORM.check_in_time,
    ),
    check_out_time: fromSnapshot(
      snapshot,
      "check_out_time",
      DEFAULT_INSTANT_FORM.check_out_time,
    ),
    break_duration_minutes: fromSnapshot(
      snapshot,
      "break_duration_minutes",
      DEFAULT_INSTANT_FORM.break_duration_minutes,
    ),
    street: fromSnapshot(
      snapshot,
      "street",
      DEFAULT_INSTANT_FORM.street,
    ),
    postal_code: fromSnapshot(
      snapshot,
      "postal_code",
      DEFAULT_INSTANT_FORM.postal_code,
    ),
    province: fromSnapshot(
      snapshot,
      "province",
      DEFAULT_INSTANT_FORM.province as Province,
    ),
    city: fromSnapshot(snapshot, "city", DEFAULT_INSTANT_FORM.city),
    neighborhood_name: fromSnapshot(
      snapshot,
      "neighborhood_name",
      DEFAULT_INSTANT_FORM.neighborhood_name,
    ),
    neighborhood_type: fromSnapshot(
      snapshot,
      "neighborhood_type",
      DEFAULT_INSTANT_FORM.neighborhood_type,
    ),
    direct_number: fromSnapshot(
      snapshot,
      "direct_number",
      DEFAULT_INSTANT_FORM.direct_number,
    ),
    responsibilities: normalizeStringArray(
      fromSnapshot(snapshot, "responsibilities", DEFAULT_INSTANT_FORM.responsibilities),
    ),
    required_skills: normalizeStringArray(
      fromSnapshot(snapshot, "required_skills", DEFAULT_INSTANT_FORM.required_skills),
    ),
    experience: normalizeStringArray(
      fromSnapshot(snapshot, "experience", DEFAULT_INSTANT_FORM.experience),
    ),
    working_conditions: normalizeStringArray(
      fromSnapshot(
        snapshot,
        "working_conditions",
        DEFAULT_INSTANT_FORM.working_conditions,
      ),
    ),
    why_join: normalizeStringArray(
      fromSnapshot(snapshot, "why_join", DEFAULT_INSTANT_FORM.why_join),
    ),
    start_date: dateFromSnapshot(snapshot, "start_date"),
    end_date: dateFromSnapshot(snapshot, "end_date"),
  };
}

export function InstantJobForm({
  onNext,
  onStepNext,
  formStep = "description",
  formId,
  autoSubmitToken,
  onValidationBlocked,
}: InstantJobFormProps) {
  const router = useRouter();
  const createJob = useJobsStore((state) => state.createJob);
  const setFormSnapshot = useJobsStore((s) => s.setFormSnapshot);
  const formSnapshot = useJobsStore((s) => s.formSnapshot);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fieldErrors, setFieldErrors] =
    useState<JobFormFieldErrors<InstantJobFormData>>({});
  const lastAutoSubmitTokenRef = useRef<number | undefined>(undefined);

  const [formData, setFormData] = useState<InstantJobFormData>(() =>
    buildInitialInstantForm(formSnapshot),
  );
  const [payRateCents, setPayRateCents] = useState<number | null>(() =>
    getCachedPayRateCents(formData.job_title),
  );
  const [payRateLoading, setPayRateLoading] = useState(false);
  const [payRateError, setPayRateError] = useState<string | null>(null);

  useEffect(() => {
    if (!formData.job_title) {
      setPayRateCents(null);
      setPayRateError(null);
      setPayRateLoading(false);
      return;
    }

    const cachedRateCents = getCachedPayRateCents(formData.job_title);
    if (cachedRateCents !== null) {
      setPayRateCents(cachedRateCents);
      setPayRateError(null);
      setPayRateLoading(false);
      return;
    }

    let didCancel = false;

    setPayRateLoading(true);
    setPayRateError(null);

    axiosInstance
      .get(ENDPOINTS.JOBS_FEES(formData.job_title))
      .then((res) => {
        if (didCancel) return;

        const dollars = Number(
          res.data?.data?.recruiter_pay_per_hour ??
            res.data?.recruiter_pay_per_hour ??
            0,
        );

        const cents = Math.round(dollars * 100);

        setPayRateCents(cents);

        const currentSnapshot = useJobsStore.getState().formSnapshot;
        setFormSnapshot({
          ...(currentSnapshot ?? {}),
          cachedPayRate: {
            jobTitle: formData.job_title,
            cents,
          },
        } as JobFormSnapshot);
      })
      .catch(() => {
        if (!didCancel) {
          setPayRateError("Could not load pay rate for this role");
        }
      })
      .finally(() => {
        if (!didCancel) {
          setPayRateLoading(false);
        }
      });

    return () => {
      didCancel = true;
    };
  }, [formData.job_title, setFormSnapshot]);

  const updateFormData = (updates: Partial<InstantJobFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));

    const currentSnapshot = useJobsStore.getState().formSnapshot;
    clearErrorsForUpdatedFields(updates, setFieldErrors);
    setFormSnapshot(buildNextFormSnapshot(currentSnapshot, updates));
  };

  const submitForm = async () => {
    if (isSubmitting) return;

    const jobTitleLabel = (formData.job_title ?? "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const experienceItems = normalizeStringArray(formData.experience);
    const workingConditionItems = normalizeStringArray(
      formData.working_conditions,
    );
    const whyJoinItems = normalizeStringArray(formData.why_join);

    const backendData: JobCreatePayload = {
      job_title: formData.job_title ?? "",
      status: "DRAFT",
      job_type: "casual",
      job_urgency: "INSTANT",
      department: formData.department || undefined,
      street: formData.street || undefined,
      postal_code: formData.postal_code || undefined,
      province: formData.province || undefined,
      city: formData.city || undefined,
      neighborhood_name: formData.neighborhood_name || undefined,
      neighborhood_type: formData.neighborhood_type || undefined,
      direct_number: formData.direct_number || undefined,
      years_of_experience: undefined,
      qualifications: undefined,
      specializations: undefined,
      ai_interview: false,
      questions: undefined,
      description: formData.description || undefined,
      no_of_hires_required: formData.no_of_hires_required
        ? parseInt(formData.no_of_hires_required, 10)
        : 1,
      start_date: formatDateForBackend(formData.start_date),
      end_date: formatDateForBackend(formData.end_date),
      check_in_time: formData.check_in_time || undefined,
      check_out_time: formData.check_out_time || undefined,
      break_duration_minutes: formData.break_duration_minutes,
      responsibilities: formData.responsibilities?.filter(Boolean).length
        ? formData.responsibilities.filter(Boolean)
        : [`Provide ${jobTitleLabel} duties as assigned`],
      required_skills: formData.required_skills?.filter(Boolean).length
        ? formData.required_skills.filter(Boolean)
        : [`Valid ${jobTitleLabel} license or certification`],
      experience: experienceItems.filter(Boolean).length
        ? experienceItems.filter(Boolean)
        : ["Relevant clinical experience required"],
      working_conditions: workingConditionItems.filter(Boolean).length
        ? workingConditionItems.filter(Boolean)
        : ["Standard healthcare facility environment"],
      why_join: whyJoinItems.filter(Boolean).length
        ? whyJoinItems.filter(Boolean)
        : ["Competitive hourly pay"],
    };

    const validationErrors = validateJobPayload(backendData);
    const scopedValidationErrors = filterValidationErrorsForStep(
      validationErrors,
      formStep,
    );

    if (formStep === "basic" && scopedValidationErrors.length === 0) {
      setFieldErrors({});
      onStepNext?.();
      return;
    }

    if (scopedValidationErrors.length > 0) {
      const allMessages = scopedValidationErrors.map((v) => v.message);
      setFieldErrors(toFormFieldErrors(scopedValidationErrors));
      toast.error(
        allMessages.length === 1
          ? allMessages[0]
          : `Please fix ${allMessages.length} issues below.`,
      );
      onValidationBlocked?.();
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);

    if (onNext) {
      setIsSubmitting(false);
      onNext(backendData);
      return;
    }

    try {
      const instantPayload = buildInstantJobCreatePayload(backendData);
      if (!instantPayload) {
        toast.error("Shift times are incomplete. Please go back and try again.");
        return;
      }

      const response = await createJob(instantPayload);
      if (response.success) {
        sessionStorage.setItem("createdJobId", response.data.id);
        setShowSuccessModal(true);
      } else {
        toast.error(response.message || "Failed to create instant replacement");
      }
    } catch (err) {
      toast.error((err as Error).message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  useEffect(() => {
    if (
      autoSubmitToken === undefined ||
      lastAutoSubmitTokenRef.current === autoSubmitToken
    ) {
      return;
    }

    lastAutoSubmitTokenRef.current = autoSubmitToken;
    void submitForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSubmitToken]);

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

      <div className="space-y-3 sm:space-y-4">
        <form
          id={formId}
          onSubmit={handleSubmit}
          noValidate
          className="contents"
        >
          {formStep === "basic" ? (
            <InstantBasicStep
              formData={formData}
              updateFormData={updateFormData}
              fieldErrors={fieldErrors}
              payRateCents={payRateCents}
              payRateLoading={payRateLoading}
              payRateError={payRateError}
            />
          ) : (
            <DescriptionForm
              formData={formData}
              updateFormData={updateFormData}
              fieldErrors={fieldErrors}
              hideExperienceList
            />
          )}
        </form>
      </div>
    </>
  );
}
