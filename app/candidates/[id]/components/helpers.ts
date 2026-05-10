import type {
  AiInterviewResultPayload,
  AiInterviewRoundBreakdown,
  CandidateDetailProfile,
  CandidateDetailsResponse,
} from "@/types";
import type { CandidateDetailVM, InterviewSummaryBlock, ScoreRound } from "@/types/view-models";
import type { CandidateDetailApiResponse } from "./interfaces";

type CandidateApiData = CandidateDetailApiResponse["data"];
type CandidateApiQualification = NonNullable<CandidateApiData["qualification"]>;

function mapEducationsToQualifications(
  educations?: CandidateApiQualification["educations"]
): CandidateDetailProfile["qualifications"] | undefined {
  if (!Array.isArray(educations)) return undefined;
  return educations.map((edu) => ({
    id: edu.id,
    type: edu.degree ?? "education",
    institution: edu.school ?? null,
    year: null,
    description: edu.field_of_study ?? null,
  }));
}

function mapEducations(
  educations?: CandidateApiQualification["educations"]
): CandidateDetailProfile["educations"] | undefined {
  if (!Array.isArray(educations)) return undefined;
  return educations.map((edu) => ({
    id: edu.id,
    school: edu.school ?? "",
    degree: edu.degree ?? "",
    field: edu.field_of_study ?? "",
    start_date: edu.start_date ?? undefined,
    end_date: edu.end_date ?? undefined,
    start_year: edu.start_date ?? undefined,
    end_year: edu.end_date ?? undefined,
  }));
}

function mapDocuments(
  documents?: CandidateApiData["documentation"]
): CandidateDetailProfile["documents"] | undefined {
  if (!Array.isArray(documents)) return undefined;
  return documents.map((doc) => ({
    document_id: doc.id,
    id: doc.id,
    document_type: doc.document_type,
    title: doc.title,
    file_url: null,
    created_at: new Date().toISOString(),
    status: doc.status,
    verified_by: doc.verified_by ?? null,
    verified_at: doc.verified_at ?? null,
  }));
}

function mapWorkExperiences(
  experiences?: CandidateApiData["work_experience"]
): CandidateDetailProfile["work_experiences"] | undefined {
  if (!Array.isArray(experiences)) return undefined;
  return experiences.map((work) => ({
    id: work.id,
    title: work.title,
    company: work.company,
    start_date: work.start_date,
    end_date: work.end_date ?? null,
    is_current: Boolean(work.is_current),
    description: work.description ?? null,
  }));
}

function mapWorkHistory(
  history?: CandidateApiData["work_history"]
): CandidateDetailProfile["work_history"] | undefined {
  if (!Array.isArray(history)) return undefined;
  return history.map((item) => ({
    application_id: item.application_id,
    job_id: "",
    job_title: item.job_title ?? "",
    organization: item.department ?? "",
    job_type: item.job_type ?? "",
    start_date: null,
    end_date: null,
    status: item.application_status ?? item.job_status ?? "",
  }));
}

function toJoinedValue(value?: string | string[] | null): string | null | undefined {
  if (!Array.isArray(value)) return value;
  return value.join(", ");
}

export function toLabel(raw?: string | null): string {
  if (!raw) return "—";
  return raw.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function toExperienceLabel(months?: number | null): string {
  if (months == null) return "—";
  const yrs = Math.floor(months / 12);
  if (yrs === 0) return `${months}+ months`;
  return `${yrs}+ ${yrs === 1 ? "year" : "years"}`;
}

function toDisplayId(uuid: string): string {
  return `KRV-${uuid.slice(0, 6).toUpperCase()}`;
}

function toDateLabel(raw?: string | null): string | null {
  if (!raw) return null;
  return new Date(raw).toLocaleDateString("en-CA", {
    month: "short",
    year: "numeric",
  });
}

const PERSONAL_TYPES = new Set([
  "passport",
  "pr_card",
  "work_permit",
  "criminal_record",
  "criminal_record_check",
]);

function isPersonalDocumentType(type?: string | null): boolean {
  if (!type) return false;
  const normalized = type.trim().toLowerCase();
  if (PERSONAL_TYPES.has(normalized)) return true;
  return PERSONAL_TYPES.has(normalized.replace(/_certificate$/, ""));
}

export function normalizeCandidateResponse(
  payload?: CandidateDetailsResponse | CandidateDetailApiResponse | null
): CandidateDetailsResponse | null {
  if (!payload?.data) return null;
  if ("candidate" in payload.data && payload.data.candidate) return payload as CandidateDetailsResponse;

  const apiData = payload as CandidateDetailApiResponse;
  const basic = apiData.data.basic;
  if (!basic) return null;
  const qualificationEducations = apiData.data.qualification?.educations;
  const mappedQualifications = mapEducationsToQualifications(qualificationEducations);
  const mappedEducations = mapEducations(qualificationEducations);
  const mappedDocuments = mapDocuments(apiData.data.documentation);
  const mappedWorkExperiences = mapWorkExperiences(apiData.data.work_experience);
  const mappedWorkHistory = mapWorkHistory(apiData.data.work_history);

  const candidate: CandidateDetailProfile = {
    ...basic,
    candidate_id: basic.candidate_id ?? basic.id,
    full_name: basic.full_name ?? `${basic.first_name ?? ""} ${basic.last_name ?? ""}`.trim(),
    department: apiData.data.qualification?.departments ?? basic.department,
    specializations: apiData.data.qualification?.specializations ?? basic.specializations,
    qualifications: mappedQualifications ?? basic.qualifications,
    educations: mappedEducations ?? basic.educations,
    documents: mappedDocuments ?? basic.documents,
    work_experiences: mappedWorkExperiences ?? basic.work_experiences,
    work_history: mappedWorkHistory ?? basic.work_history,
    job_type: basic.job_type ?? null,
    preferred_location: toJoinedValue(basic.preferred_location),
    ratings: Array.isArray(apiData.data.ratings?.recent_reviews)
      ? apiData.data.ratings.recent_reviews
      : basic.ratings,
    general_score: (() => {
      const apiGs = apiData.data.general_score;
      const baseGs =
        basic.general_score && typeof basic.general_score === "object"
          ? basic.general_score
          : undefined;
      if (apiGs && typeof apiGs === "object" && !Array.isArray(apiGs)) {
        return {
          ...(baseGs ?? {}),
          ...apiGs,
          avg_rating_score:
            (typeof apiGs === "object" &&
            apiGs &&
            "avg_rating_score" in apiGs &&
            apiGs.avg_rating_score !== undefined
              ? apiGs.avg_rating_score
              : undefined) ??
            baseGs?.avg_rating_score ??
            apiData.data.ratings?.avg_rating ??
            null,
        } as CandidateDetailProfile["general_score"];
      }
      return {
        ...(baseGs ?? {}),
        avg_rating_score:
          baseGs?.avg_rating_score ??
          apiData.data.ratings?.avg_rating ??
          null,
      } as CandidateDetailProfile["general_score"];
    })(),
  };

  return {
    success: payload.success,
    message: payload.message,
    data: { candidate },
  };
}

function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function mapRound(
  round: AiInterviewRoundBreakdown,
  strengthsText: string | null
): ScoreRound {
  const sub = round.sub_metrics ?? {};
  return {
    score: parseOptionalNumber(round.score),
    strengths: strengthsText,
    ...sub,
  };
}

/** Resolve nested legacy eval vs flat `general_score` object from API. */
function resolveInterviewEvalBlock(
  gs: CandidateDetailProfile["general_score"]
): Record<string, unknown> | null {
  if (!gs || typeof gs !== "object") return null;
  const root = gs as Record<string, unknown>;
  const nested = root.best_ai_interview_score;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  const hasFlatKeys =
    "overall_score" in root ||
    "result" in root ||
    "max_self_interview_score" in root ||
    "created_at" in root;
  if (hasFlatKeys) return root;
  return null;
}

function mapSummaryBlock(result: Record<string, unknown> | null): InterviewSummaryBlock {
  if (!result) return null;
  const riskFlags = (result.risk_flags ?? {}) as Record<string, boolean>;
  return {
    strengths: Array.isArray(result.strengths) ? (result.strengths as string[]) : [],
    risk_flags: {
      communication_red_flag: Boolean(riskFlags.communication_red_flag),
      unsafe_decision_detected: Boolean(riskFlags.unsafe_decision_detected),
      critical_safety_violation: Boolean(riskFlags.critical_safety_violation),
    },
    interview_summary: typeof result.interview_summary === 'string' ? result.interview_summary : null,
    recommendation: typeof result.recommendation === 'string' ? result.recommendation : null,
    areas_to_improve: Array.isArray(result.areas_to_improve) ? (result.areas_to_improve as string[]) : [],
  };
}

export function fromDetailProfile(p: CandidateDetailProfile): CandidateDetailVM {
  
  const currentJob = p.work_experiences?.find((w) => w.is_current) ?? null;
  const educationById = new Map((p.educations ?? []).map((edu) => [edu.id, edu]));
  const allDocs = (p.documents ?? []).map((doc) => ({
    document_id: doc.document_id ?? "",
    title: doc.title,
    document_type: doc.document_type,
    verified:
      Boolean(doc.verified_by) || Boolean(doc.verified_at) || doc.status === "verified",
    category: isPersonalDocumentType(doc.document_type)
      ? ("personal" as const)
      : ("license_certificate" as const),
    file_url: doc.file_url ?? null,
    signed_url: null,
  }));

  const ratings = p.ratings ?? [];
  const total = ratings.length;
  const average =
    total > 0
      ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
      : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r.rating === star).length,
  }));

  // ── AI interview evaluation ──────────────────────────────────────────────
  const rawEval = resolveInterviewEvalBlock(p.general_score);

  const overallScore =
    rawEval !== null ? parseOptionalNumber(rawEval.overall_score) : null;

  const maxSelfInterviewScore =
    rawEval !== null
      ? parseOptionalNumber(rawEval.max_self_interview_score)
      : null;

  const interviewCreatedAt =
    rawEval !== null && typeof rawEval.created_at === "string"
      ? rawEval.created_at
      : null;

  const interviewResultRaw =
    rawEval !== null && "result" in rawEval ? rawEval.result : null;

  const typedInterviewResult: AiInterviewResultPayload | null =
    interviewResultRaw !== null &&
    typeof interviewResultRaw === "object" &&
    !Array.isArray(interviewResultRaw)
      ? (interviewResultRaw as AiInterviewResultPayload)
      : null;

  const breakdown = typedInterviewResult?.score_breakdown ?? null;

  const strengthsRaw = typedInterviewResult?.strengths;
  const strengthsText = Array.isArray(strengthsRaw)
    ? strengthsRaw.join(" • ")
    : typeof strengthsRaw === "string"
      ? strengthsRaw
      : null;

  const conversationalRound = breakdown?.conversational_intelligence
    ? mapRound(breakdown.conversational_intelligence, strengthsText)
    : null;

  const behavioralRound = breakdown?.behavioral_professionalism
    ? mapRound(breakdown.behavioral_professionalism, strengthsText)
    : null;

  const communicationAnalysis = breakdown?.communication_clarity
    ? mapRound(breakdown.communication_clarity, strengthsText)
    : null;

  const accuracyOfAnswers = breakdown?.clinical_competency
    ? mapRound(breakdown.clinical_competency, strengthsText)
    : null;

  const summaryBlock = mapSummaryBlock(
    typedInterviewResult
      ? (typedInterviewResult as unknown as Record<string, unknown>)
      : null,
  );

  return {
    id: p.candidate_id ?? "",
    display_id: toDisplayId(p.candidate_id ?? ""),
    full_name: p.full_name,
    profile_image_url: p.profile_image_url ?? null,
    job_title: toLabel(p.job_title),
    city: p.city ?? null,
    province: p.state ?? null,
    work_eligibility: p.work_eligibility ?? null,
    specializations: p.specializations ?? [],
    job_type: Array.isArray(p.job_type) ? p.job_type.join(", ") : (p.job_type ?? null),
    kpis: {
      attendance_accuracy: null,
      total_work_experience_months:
        p.static_experience_months ?? p.experience_in_months ?? null,
      total_work_experience: toExperienceLabel(
        p.static_experience_months ?? p.experience_in_months
      ),
      current_role: currentJob ? toLabel(currentJob.title) : null,
      current_organization: currentJob ? currentJob.company : null,
      preferred_location: null,
    },
    general_score: {
      overall_score: overallScore,
      max_self_interview_score: maxSelfInterviewScore,
      interview_result: typedInterviewResult,
      interview_created_at: interviewCreatedAt,
      avg_rating_score: p.general_score?.avg_rating_score ?? null,
      interview_summary_block: summaryBlock,
      conversational_round: conversationalRound,
      behavioral_round: behavioralRound,
      communication_analysis: communicationAnalysis,
      accuracy_of_answers: accuracyOfAnswers,
    },
    qualifications:
      (p.educations ?? []).length > 0
        ? (p.educations ?? []).map((edu) => ({
            id: edu.id,
            degree: edu.degree ?? "—",
            field: edu.field ?? "—",
            institution: edu.school ?? null,
            start_year: edu.start_date ?? edu.start_year ?? null,
            end_year: edu.end_date ?? edu.end_year ?? null,
          }))
        : (p.qualifications ?? []).map((q) => {
            const education = educationById.get(q.id);
            const startDate = education?.start_date ?? education?.start_year ?? null;
            const endDate = education?.end_date ?? education?.end_year ?? null;
            return {
              id: q.id,
              degree: toLabel(q.type),
              field: q.description ?? "—",
              institution: q.institution,
              start_year: startDate,
              end_year: endDate ?? (q.year ? `${q.year}` : null),
            };
          }),
    documents: {
      personal: allDocs.filter((d) => d.category === "personal"),
      licenses_certificates: allDocs.filter((d) => d.category === "license_certificate"),
    },
    work_experiences: (p.work_experiences ?? []).map((w) => ({
      id: w.id,
      organization: w.company,
      role: w.title,
      job_type: null,
      start_date: w.start_date,
      end_date: w.is_current ? "Present" : w.end_date,
      is_current: w.is_current,
      description: w.description,
      org_photo: null,
    })),
    work_history: (p.work_history ?? []).map((h) => ({
      application_id: h.application_id,
      job_title: toLabel(h.job_title),
      organization: h.organization ?? "—",
      job_type: toLabel(h.job_type),
      completed_date: toDateLabel(h.end_date),
      status: toLabel(h.status),
    })),
    ratings: {
      average_score: average,
      total_reviews: total,
      star_distribution: ratingCounts.map(({ star, count }) => ({
        stars: star as 5 | 4 | 3 | 2 | 1,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      })),
      reviews: ratings.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        job_title: toLabel(r.job_title),
        organization: null,
        recruiter_title: null,
        created_at: new Date(r.created_at).toLocaleDateString("en-CA", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      })),
    },
  };
}