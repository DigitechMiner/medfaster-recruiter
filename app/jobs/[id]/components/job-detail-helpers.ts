import type {
  InstantJobDetails,
  JobBackendResponse,
  JobFundingDetails,
  JobListShiftTemplate,
  JobRotationalTeam,
  JobShiftSnapshot,
  JobUrgency,
  NormalJobDetails,
  PreviewShiftMode,
} from "@/types";

export type JobDetailPayload = Omit<
  Partial<JobBackendResponse>,
  "pay_per_hour_cents" | "job_urgency" | "funding" | "normalJob"
> & {
  id: string;
  title?: string;
  street?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  neighborhood_name?: string | null;
  neighborhood_type?: string | null;
  direct_number?: string | null;
  pay_per_hour_cents?: string | number;
  job_urgency?: JobUrgency | string | null;
  years_of_experience?: string | null;
  qualifications?: string[] | null;
  specializations?: (number | string)[] | null;
  ai_interview?: boolean | null;
  questions?: NormalJobDetails["questions"] | null;
  shift_templates?: JobListShiftTemplate[] | null;
  employment_tenure?: string | null;
  funding?: Partial<JobFundingDetails> & Record<string, unknown> | null;
  normalJob?: Partial<NormalJobDetails> & Record<string, unknown> | null;
  shift_mode?: PreviewShiftMode | string | null;
  rotation_cycle_days?: number | null;
  cycle_start_day?: NormalJobDetails["cycle_start_day"];
  rotational_teams?: JobRotationalTeam[] | null;
  shift_count?: number | string | null;
};

function mapShiftCount(
  value: number | string | null | undefined,
): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeJobUrgency(value?: JobUrgency | string | null): JobUrgency {
  const raw = (value ?? "NORMAL").toString().toUpperCase();
  return raw === "INSTANT" ? "INSTANT" : "NORMAL";
}

function mapFunding(
  funding: JobDetailPayload["funding"],
): JobFundingDetails | null {
  if (!funding) return null;

  const totalContract =
    funding.total_contract_amount_cents ?? funding.total_amount_cents ?? null;
  const totalHeld =
    funding.total_held_amount_cents ?? funding.held_amount_cents ?? null;
  const totalSpent = funding.total_spent_amount_cents ?? null;
  const totalRefunded =
    funding.total_refunded_amount_cents ?? funding.refunded_amount_cents ?? null;
  const totalPaid = funding.total_paid_amount_cents ?? null;

  return {
    id: funding.id ?? "",
    job_id: funding.job_id ?? "",
    recruiter_user_id: funding.recruiter_user_id ?? "",
    wallet_id: funding.wallet_id ?? "",
    funding_type: funding.funding_type ?? null,
    total_contract_amount_cents: totalContract,
    total_held_amount_cents: totalHeld,
    total_spent_amount_cents: totalSpent,
    total_refunded_amount_cents: totalRefunded,
    total_paid_amount_cents: totalPaid,
    total_remaining_amount_cents: funding.total_remaining_amount_cents ?? null,
    // Legacy aliases for older API shapes
    total_amount_cents: totalContract,
    held_amount_cents: totalHeld,
    released_amount_cents: totalPaid,
    refunded_amount_cents: totalRefunded,
    status: funding.status ?? null,
    created_at: funding.created_at ?? "",
    updated_at: funding.updated_at ?? funding.created_at ?? "",
  };
}

function normalizeShiftMode(
  value?: PreviewShiftMode | string | null,
): PreviewShiftMode | null {
  if (!value) return null;
  const raw = value.toString().toUpperCase();
  return raw === "ROTATIONAL" ? "ROTATIONAL" : "STANDARD";
}

function resolveRotationalTeams(
  job: JobDetailPayload,
): JobRotationalTeam[] | undefined {
  const fromJob = job.rotational_teams;
  const fromNormal = job.normalJob?.rotational_teams;
  const teams = fromJob?.length ? fromJob : fromNormal;
  if (!teams?.length) return undefined;
  return [...teams].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );
}

function resolveShiftMode(job: JobDetailPayload): PreviewShiftMode | null {
  return (
    normalizeShiftMode(job.shift_mode) ??
    normalizeShiftMode(job.normalJob?.shift_mode) ??
    (resolveRotationalTeams(job)?.length ? "ROTATIONAL" : null)
  );
}

function buildNormalJob(
  job: JobDetailPayload,
  createdAt: string,
  jobUrgency: JobUrgency,
): NormalJobDetails | null {
  if (job.normalJob) {
    return {
      id: job.normalJob.id ?? job.id,
      job_id: job.normalJob.job_id ?? job.id,
      years_of_experience: job.normalJob.years_of_experience ?? "0",
      qualifications: job.normalJob.qualifications ?? [],
      specializations: job.normalJob.specializations ?? [],
      ai_interview: job.normalJob.ai_interview ?? false,
      questions: job.normalJob.questions ?? null,
      created_at: job.normalJob.created_at ?? createdAt,
      updated_at: job.normalJob.updated_at ?? createdAt,
      shift_mode: resolveShiftMode(job),
      rotation_cycle_days:
        job.rotation_cycle_days ??
        job.normalJob.rotation_cycle_days ??
        null,
      cycle_start_day: job.normalJob.cycle_start_day ?? null,
      rotational_teams: resolveRotationalTeams(job),
      team_candidate_rotations: job.normalJob.team_candidate_rotations ?? [],
    };
  }

  if (jobUrgency === "INSTANT") return null;

  const hasNormalFields =
    job.years_of_experience != null ||
    (job.qualifications?.length ?? 0) > 0 ||
    (job.specializations?.length ?? 0) > 0 ||
    job.ai_interview != null ||
    job.questions != null;

  if (!hasNormalFields) return null;

  return {
    id: job.id,
    job_id: job.id,
    years_of_experience: job.years_of_experience ?? "0",
    qualifications: job.qualifications ?? [],
    specializations: job.specializations ?? [],
    ai_interview: job.ai_interview ?? false,
    questions: job.questions ?? null,
    created_at: createdAt,
    updated_at: job.updated_at ?? createdAt,
    shift_mode: resolveShiftMode(job),
    rotation_cycle_days: job.rotation_cycle_days ?? null,
    cycle_start_day: job.cycle_start_day ?? null,
    rotational_teams: resolveRotationalTeams(job),
    team_candidate_rotations: [],
  };
}

function buildInstantJob(
  job: JobDetailPayload,
  createdAt: string,
  jobUrgency: JobUrgency,
): InstantJobDetails | null {
  if (job.instantJob) return job.instantJob;

  if (jobUrgency !== "INSTANT") return null;

  return {
    id: job.id,
    job_id: job.id,
    neighborhood_name: job.neighborhood_name ?? null,
    neighborhood_type: job.neighborhood_type ?? null,
    direct_number: job.direct_number ?? null,
    created_at: createdAt,
    updated_at: job.updated_at ?? createdAt,
  };
}

function formatShiftTemplateLine(shift: JobListShiftTemplate): string {
  const start = shift.start_time?.slice(0, 5);
  const end = shift.end_time?.slice(0, 5);
  const parts: string[] = [];

  if (start && end) parts.push(`${start} – ${end}`);
  if (shift.break_minutes != null && shift.break_minutes > 0) {
    parts.push(`${shift.break_minutes} min break`);
  }

  const details = parts.length > 0 ? ` (${parts.join(", ")})` : "";
  return `${shift.shift_name}${details}`;
}

function buildShiftSnapshot(
  shiftTemplates: JobListShiftTemplate[] | null | undefined,
  existingSnapshot: JobShiftSnapshot | null | undefined,
): JobShiftSnapshot | null {
  if (existingSnapshot) return existingSnapshot;
  if (!shiftTemplates?.length) return null;

  return {
    shift_summaries: shiftTemplates.map(formatShiftTemplateLine),
    is_night_shift: shiftTemplates.some((shift) => shift.shift_type === "NIGHT"),
    total_working_hours_label: shiftTemplates[0]?.duration_hours
      ? `${shiftTemplates[0].duration_hours}h per shift`
      : null,
  };
}

export function isRotationalJob(job: {
  shift_mode?: PreviewShiftMode | null;
  rotational_teams?: JobRotationalTeam[];
  normalJob?: NormalJobDetails | null;
}): boolean {
  if (job.shift_mode === "ROTATIONAL") return true;
  if (job.normalJob?.shift_mode === "ROTATIONAL") return true;
  const teams = job.rotational_teams ?? job.normalJob?.rotational_teams;
  return (teams?.length ?? 0) > 0;
}

export function getJobRotationalTeams(
  job: JobBackendResponse,
): JobRotationalTeam[] {
  const teams = job.rotational_teams ?? job.normalJob?.rotational_teams ?? [];
  return [...teams].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );
}

function getDateDurationDays(
  startDate?: string | null,
  endDate?: string | null,
): number {
  if (!startDate) return 0;

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;
  const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;

  if (!Number.isFinite(days) || days < 1) return 0;
  return days;
}

/** Total staffed shift slots across the job date range for rotational jobs. */
export function getRotationalShiftCount(job: {
  start_date?: string | null;
  end_date?: string | null;
  rotation_cycle_days?: number | null;
  rotational_teams?: JobRotationalTeam[];
  normalJob?: NormalJobDetails | null;
}): number | null {
  const teams = job.rotational_teams ?? job.normalJob?.rotational_teams;
  if (!teams?.length || !job.start_date) return null;

  const cycleLength = job.rotation_cycle_days ?? job.normalJob?.rotation_cycle_days ?? 14;
  const calendarDays = getDateDurationDays(job.start_date, job.end_date);
  if (!calendarDays) return null;

  let total = 0;
  for (let offset = 0; offset < calendarDays; offset++) {
    const cycleDay = (offset % cycleLength) + 1;
    for (const team of teams) {
      for (const cycle of team.cycles) {
        if (cycle.cycle_day !== cycleDay || cycle.is_working === false) continue;
        total += cycle.required_workers ?? 1;
      }
    }
  }

  return total;
}

export function getStandardShiftCount(job: {
  no_of_hires_required: number;
  start_date?: string | null;
  end_date?: string | null;
  shift_templates?: JobListShiftTemplate[];
}): number {
  const shiftsPerDay = job.shift_templates?.length || 1;
  return (
    job.no_of_hires_required *
    getDateDurationDays(job.start_date, job.end_date) *
    shiftsPerDay
  );
}

export function getJobShiftCount(job: JobBackendResponse): number {
  if (job.shift_count != null) return job.shift_count;

  const rotational = getRotationalShiftCount(job);
  if (rotational != null) return rotational;
  return getStandardShiftCount(job);
}

export function getRotationalScheduleSubLabel(job: JobBackendResponse): string | null {
  if (!isRotationalJob(job)) return null;

  const teams = getJobRotationalTeams(job);
  const cycleDays = job.rotation_cycle_days ?? job.normalJob?.rotation_cycle_days ?? 14;
  const teamLabel = `${teams.length} team${teams.length === 1 ? "" : "s"}`;
  return `${teamLabel} · ${cycleDays}-day rotation`;
}

export function mapJobDetail(job: JobDetailPayload): JobBackendResponse {
  const createdAt = job.created_at ?? "";
  const jobUrgency = normalizeJobUrgency(job.job_urgency);
  const shiftTemplates = job.shift_templates ?? [];
  const shiftMode = resolveShiftMode(job);
  const rotationalTeams = resolveRotationalTeams(job);
  const rotationCycleDays =
    job.rotation_cycle_days ?? job.normalJob?.rotation_cycle_days ?? null;

  return {
    id: job.id,
    recruiter_profile_id: job.recruiter_profile_id ?? "",
    job_title: job.job_title ?? job.title ?? "Untitled Job",
    department: job.department ?? null,
    job_type: job.job_type ?? null,
    job_urgency: jobUrgency,
    street: job.street ?? null,
    postal_code: job.postal_code ?? null,
    province: job.province ?? null,
    city: job.city ?? null,
    geolocation: job.geolocation ?? null,
    pay_per_hour_cents: String(job.pay_per_hour_cents ?? "0"),
    fee_snapshot: job.fee_snapshot ?? null,
    shift_snapshot: buildShiftSnapshot(shiftTemplates, job.shift_snapshot),
    shift_count: mapShiftCount(job.shift_count),
    no_of_hires_required: job.no_of_hires_required ?? 0,
    no_of_hires_hired: job.no_of_hires_hired ?? 0,
    application_count: job.application_count ?? 0,
    start_date: job.start_date ?? null,
    end_date: job.end_date ?? null,
    check_in_time: job.check_in_time ?? null,
    check_out_time: job.check_out_time ?? null,
    status: job.status ?? "OPEN",
    closed_reason: job.closed_reason ?? null,
    recruiter_close_note: job.recruiter_close_note ?? null,
    created_at: createdAt,
    updated_at: job.updated_at ?? createdAt,
    normalJob: buildNormalJob(job, createdAt, jobUrgency),
    instantJob: buildInstantJob(job, createdAt, jobUrgency),
    funding: mapFunding(job.funding),
    description: job.description ?? null,
    responsibilities: job.responsibilities ?? [],
    required_skills: job.required_skills ?? [],
    experience: job.experience ?? [],
    working_conditions: job.working_conditions ?? [],
    why_join: job.why_join ?? [],
    employment_tenure: job.employment_tenure ?? null,
    shift_templates: shiftTemplates,
    shift_mode: shiftMode,
    rotation_cycle_days: rotationCycleDays,
    cycle_start_day:
      job.cycle_start_day ?? job.normalJob?.cycle_start_day ?? null,
    rotational_teams: rotationalTeams,
    team_candidate_rotations: job.normalJob?.team_candidate_rotations ?? [],
  };
}

export function getJobShiftDisplayLines(job: {
  shift_templates?: JobListShiftTemplate[];
  check_in_time?: string | null;
  check_out_time?: string | null;
  rotational_teams?: JobRotationalTeam[];
  normalJob?: NormalJobDetails | null;
}): string[] {
  if (job.shift_templates?.length) {
    return job.shift_templates.map(formatShiftTemplateLine);
  }

  const teams = job.rotational_teams ?? job.normalJob?.rotational_teams;
  if (teams?.length) {
    const byTemplateIndex = new Map<number, JobListShiftTemplate>();
    for (const team of teams) {
      for (const cycle of team.cycles) {
        if (!cycle.is_working) continue;
        if (byTemplateIndex.has(cycle.shift_template_index)) continue;
        byTemplateIndex.set(cycle.shift_template_index, {
          shift_name: cycle.shift_name,
          shift_type: cycle.shift_type,
          start_time: cycle.start_time,
          end_time: cycle.end_time,
          duration_hours: cycle.duration_hours,
          break_minutes: cycle.break_minutes,
        });
      }
    }

    const lines = [...byTemplateIndex.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, shift]) => formatShiftTemplateLine(shift));

    if (lines.length > 0) return lines;
  }

  const checkIn = job.check_in_time?.slice(0, 5);
  const checkOut = job.check_out_time?.slice(0, 5);
  if (checkIn && checkOut) return [`${checkIn} – ${checkOut}`];

  return [];
}

export function formatLabel(value?: string | null) {
  if (!value) return "N/A";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDate(value?: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTime(value?: string | null) {
  if (!value) return "N/A";
  const [hours, minutes] = value.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "pm" : "am"}`;
}

export function formatPay(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "N/A";
  return `$${(Number(value) / 100).toFixed(2)}`;
}
