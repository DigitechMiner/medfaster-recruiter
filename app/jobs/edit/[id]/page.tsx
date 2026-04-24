"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/global/app-layout";
import { JobForm, JobFormData } from "../../components/JobForm";
import {
  DEFAULT_JOB_FORM_DATA,
  DEFAULT_TOPICS,
  Topic,
} from "../../constants/form";
import SuccessModal from "@/components/modal";
import { useQuestions } from "@/hooks/useQuestions";
import { useJobsStore } from "@/stores/jobs-store";
import type {
  JobBackendResponse,
  JobCreatePayload,
  JobUpdatePayload,
} from "@/Interface/job.types";
import metadata, { convertProvinceToJobBackend } from "@/utils/constant/metadata";
import {
  convertToFrontendValue,
  convertToBackendValue,
} from "@/utils/constant/jobTypes";
import { useJob, useJobId } from "@/hooks/useJobData";
import { ArrowLeft } from "lucide-react";
import {
  convertJobTitleToBackend,
  convertQualificationToBackend,
  convertQualificationToFrontend,   // ✅ replaces local QUALIFICATION_REVERSE_MAP
  convertSpecializationToBackend,
  convertSpecializationToFrontend,
  convertProvinceToFrontend,         // ✅ replaces local convertProvinceToFrontend + PROVINCE_CODE_MAP
  convertExperienceToBackend,        // ✅ converts "2-3 Yrs" → "2" before sending
  convertExperienceToFrontend,       // ✅ converts "2" → "2-3 Yrs" when loading form
} from "@/utils/constant/metadata";

const formatDateForBackend = (date?: Date | null): string | undefined => {
  if (!date) return undefined;
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
// ✅ Strip parenthetical suffix: "Licensed Practical Nurse (LPN)" → "Licensed Practical Nurse"
const normalizeJobTitle = (backendTitle: string | null | undefined): string => {
  if (!backendTitle) return metadata.job_title[0];
  const stripped = backendTitle.replace(/\s*\(.*?\)\s*$/, "").trim();
  if (metadata.job_title.includes(stripped)) return stripped;
  if (metadata.job_title.includes(backendTitle)) return backendTitle;
  return metadata.job_title[0];
};


export default function EditJobPage() {
  const router = useRouter();
  const jobId = useJobId();
  const { job, isLoading, error } = useJob(jobId);
  const updateJob = useJobsStore((state) => state.updateJob);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<JobFormData>(DEFAULT_JOB_FORM_DATA);
  const [formReady, setFormReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { topics, setTopics, addQuestion, removeQuestion, updateQuestion } =
    useQuestions(DEFAULT_TOPICS);


 const convertBackendToFormData = useCallback(
  (job: JobBackendResponse): JobFormData => {
    const normalJob  = job.normalJob;

    // pay_per_hour_cents → dollars for the form slider
    const hourlyDollars = job.pay_per_hour_cents != null
  ? parseInt(job.pay_per_hour_cents, 10) / 100   // ← parseInt first
  : 0;

    return {
      jobTitle:    normalizeJobTitle(job.job_title),
      department:  job.department || "",
      jobType:     convertToFrontendValue(job.job_type),
      location:    job.city || "",

      // ── Pay ──────────────────────────────────────────
      payRange: [hourlyDollars, hourlyDollars] as [number, number],

      urgency:     job.job_urgency || "normal",
      description: job.description || "",
      status:      job.status || "DRAFT",

      // ── Hiring ───────────────────────────────────────
      numberOfHires: job.no_of_hires_required?.toString() || undefined,

      // ── Location ─────────────────────────────────────
      streetAddress: job.street      || undefined,
      postalCode:    job.postal_code || undefined,
      province:      convertProvinceToFrontend(job.province),
      city:          job.city        || undefined,
      country:       undefined,

      // ── Normal job fields ────────────────────────────
      experience:     convertExperienceToFrontend(normalJob?.years_of_experience),
      qualification:  Array.isArray(normalJob?.qualifications)
                        ? normalJob.qualifications.map(convertQualificationToFrontend)
                        : [],
      specialization: Array.isArray(normalJob?.specializations)
                        ? normalJob.specializations.map((s) =>
                            convertSpecializationToFrontend(String(s))
                          )
                        : [],
      aiInterview:    normalJob?.ai_interview === true ? "Yes" : "No",

      inPersonInterview: "No",
      physicalInterview: "No",

      // ── Shift — from job root (not instantJob) ───────
      fromDate: job.start_date    ? new Date(job.start_date)    : undefined,
      tillDate: job.end_date      ? new Date(job.end_date)      : undefined,
      fromTime: job.check_in_time  || undefined,
      toTime:   job.check_out_time || undefined,
    };
  },
  []
);


  const convertQuestionsToTopics = (
    questions: Record<string, { title: string; questions: string[] }> | null
  ): Topic[] => {
    if (!questions) return DEFAULT_TOPICS;
    return Object.entries(questions).map(([topicId, topicData], index) => ({
      id: topicId || String(index + 1),
      title: topicData.title || `Questions Topic ${index + 1}`,
      questions: topicData.questions.map((q, qIndex) => ({
        id: `${topicId}-${qIndex + 1}`,
        text: q,
      })),
    }));
  };


  useEffect(() => {
    if (job) {
      console.log("🔍 RAW JOB FROM BACKEND:", JSON.stringify(job, null, 2));
      const converted = convertBackendToFormData(job);
      console.log("✅ CONVERTED FORM DATA:", JSON.stringify(converted, null, 2));
      setFormData(converted);
      if (job.normalJob?.questions) {
        setTopics(convertQuestionsToTopics(job.normalJob.questions));
      }
      setFormReady(true);
    }
  }, [job, setTopics, convertBackendToFormData]);


  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData((prev: JobFormData) => ({ ...prev, ...updates }));
  };


 const convertToBackendFormat = (
  data: JobFormData,
  questionsData: Record<string, { title: string; questions: string[] }>
): JobUpdatePayload => {
  const isNormalJob = data.urgency === 'normal';

  const payload: Partial<JobCreatePayload> = {
    job_title:   convertJobTitleToBackend(data.jobTitle),
    department:  data.department || undefined,
    job_type:    convertToBackendValue(data.jobType) as 'casual' | 'part_time' | 'full_time',
    street:      data.streetAddress || undefined,
    postal_code: data.postalCode    || undefined,
    province:    convertProvinceToJobBackend(data.province) as string | undefined,
    city:        data.city          || undefined,

    // ✅ number, not string
    pay_per_hour_cents: data.payRange[0]
      ? Math.round(data.payRange[0] * 100)
      : undefined,

    job_urgency:  data.urgency,
    description:  data.description || undefined,
    questions:    topics.flatMap((t) => t.questions.map((q) => q.text)).filter(Boolean),
    status:       data.status,
  };

  if (data.numberOfHires && data.numberOfHires.trim() !== '') {
    const parsed = parseInt(data.numberOfHires, 10);
    if (!isNaN(parsed)) payload.no_of_hires_required = parsed;
  }

  if (isNormalJob) {
    if (data.experience && data.experience.trim() !== '') {
      payload.years_of_experience =
        convertExperienceToBackend(data.experience) ?? data.experience;
    }

    if (Array.isArray(data.qualification)) {
      const validQualifications = data.qualification
        .filter((q) => q && typeof q === 'string' && q.trim() !== '')
        .map((q) => convertQualificationToBackend(q))
        .filter((q) => Object.values(metadata.qualification_mapping).includes(q));

      if (validQualifications.length > 0) {
        payload.qualifications = validQualifications;
      }
    }

    if (Array.isArray(data.specialization)) {
      const validSpecializations = data.specialization
        .filter((s) => s && typeof s === 'string' && s.trim() !== '')
        .map((s) => convertSpecializationToBackend(s))
        .filter((s) => Object.values(metadata.specialization_mapping).includes(s));

      if (validSpecializations.length > 0) {
        payload.specializations = validSpecializations;
      }
    }

    payload.ai_interview = data.aiInterview === 'Yes';
  } else {
    if (data.fromDate) payload.start_date    = formatDateForBackend(data.fromDate);
    if (data.tillDate) payload.end_date      = formatDateForBackend(data.tillDate);
    if (data.fromTime) payload.check_in_time  = data.fromTime;
    if (data.toTime)   payload.check_out_time = data.toTime;
  }

  console.log('📤 FINAL PAYLOAD:', JSON.stringify(payload, undefined, 2));
  return payload as JobUpdatePayload;
};

  const convertTopicsToBackendFormat = (
    topics: Topic[]
  ): Record<string, { title: string; questions: string[] }> => {
    const questionsObject: Record<string, { title: string; questions: string[] }> = {};
    topics.forEach((topic) => {
      questionsObject[topic.id] = {
        title: topic.title,
        questions: topic.questions
          .map((q) => q.text)
          .filter((text) => text.trim() !== ""),
      };
    });
    return questionsObject;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) {
      setSubmitError("Job ID not found");
      return;
    }

    if (formData.urgency === "normal") {
      const validQualifications =
        formData.qualification?.filter((q) => q && q.trim() !== "") || [];
      const validSpecializations =
        formData.specialization?.filter((s) => s && s.trim() !== "") || [];

      if (validQualifications.length === 0) {
        setSubmitError("Please add at least one qualification for normal jobs");
        return;
      }
      if (validSpecializations.length === 0) {
        setSubmitError("Please add at least one specialization for normal jobs");
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const questionsData = convertTopicsToBackendFormat(topics);
      const backendData = convertToBackendFormat(formData, questionsData);
      const response = await updateJob(jobId, backendData);

      if (response.success) {
        setShowSuccessModal(true);
      } else {
        setSubmitError(response.message || "Failed to update job");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error updating job:", error);
      setSubmitError(error.message || "An error occurred while updating the job");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleCancel = () => router.push(`/jobs/${jobId}`);

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push(`/jobs/${jobId}`);
  };


  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F4781B]" />
        </div>
      </AppLayout>
    );
  }

  if (error || !job) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-red-600">{error || "Job not found"}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {submitError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Job post</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex items-center gap-2 flex-1 sm:flex-none px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white font-medium text-sm rounded-sm disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={() =>
              handleSubmit({ preventDefault: () => {} } as React.FormEvent)
            }
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-6 py-2 bg-[#F4781B] hover:bg-orange-600 text-white font-medium text-sm rounded-sm disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save & continue"}
          </button>
        </div>
      </div>

      {/* ✅ Only render form after formData is fully populated */}
      {!formReady ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F4781B]" />
        </div>
      ) : (
        <JobForm
          key={job.id}
          mode="edit"
          formData={formData}
          updateFormData={updateFormData}
          topics={topics}
          onAddQuestion={addQuestion}
          onRemoveQuestion={removeQuestion}
          onUpdateQuestion={updateQuestion}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          showInterviewQuestions={true}
          showBackButton={true}
          submitLabel={isSubmitting ? "Saving..." : "Save"}
        />
      )}

      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessClose}
        title="Job updated successfully"
        message={`${job.job_title} - Job ID: ${jobId} is now live and ready for applicants.`}
        buttonText="Done"
      />
    </AppLayout>
  );
}