import type {
  ExperienceJobTitleFee,
  ExperienceTierRate,
  FeeExperienceLevel,
  FeesSummaryData,
  FeesSummaryScope,
  InstantJobTitleFee,
} from "./types";

const SMALL_WORDS = new Set(["a", "an", "and", "of", "the", "for", "to"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function toShortJobTitle(label: string, explicit?: string | null): string {
  const provided = explicit?.trim();
  if (provided) return provided;

  const inside = label.match(/\(([^)]+)\)\s*$/)?.[1]?.trim();
  if (inside && inside.length <= 12 && !/\s/.test(inside)) return inside;

  const words = label
    .replace(/\([^)]*\)/g, " ")
    .split(/[\s_/]+/)
    .map((word) => word.replace(/[^A-Za-z0-9]/g, ""))
    .filter((word) => word && !SMALL_WORDS.has(word.toLowerCase()));

  if (words.length === 1 && words[0].length <= 10) return words[0];

  const initials = words.map((word) => word.charAt(0).toUpperCase()).join("");
  if (initials.length >= 2 && initials.length <= 8) return initials;
  return label;
}

function readRates(value: unknown): ExperienceTierRate[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const nestedLevel = isRecord(item.experience_level) ? item.experience_level : null;
    const experienceLevelId =
      asNumber(item.experience_level_id) ?? (nestedLevel ? asNumber(nestedLevel.id) : null);
    const payPerHour = asNumber(item.pay_per_hour ?? item.recruiter_pay_per_hour);
    if (experienceLevelId == null || payPerHour == null) return [];

    const discount = asNumber(item.discount_per_hour) ?? 0;
    return [
      {
        experience_level_id: experienceLevelId,
        pay_per_hour: payPerHour,
        discount_per_hour: discount > 0 ? discount : 0,
      },
    ];
  });
}

function readJobLabel(item: Record<string, unknown>): string {
  return (
    asString(item.label) ??
    asString(item.job_title_label) ??
    asString(item.job_title_value)?.replace(/_/g, " ") ??
    "Job title"
  );
}

function readStandardJobs(value: unknown): ExperienceJobTitleFee[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const id = asNumber(item.id ?? item.job_title_id);
    if (id == null) return [];

    const label = readJobLabel(item);
    return [
      {
        id,
        short_label: toShortJobTitle(label, asString(item.short_label) ?? asString(item.abbreviation)),
        label,
        has_custom_rates: Boolean(item.has_custom_rates ?? item.has_recruiter_specific_rates),
        rates: readRates(item.rates),
      },
    ];
  });
}

function readInstantJobs(value: unknown): InstantJobTitleFee[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const id = asNumber(item.id ?? item.job_title_id);
    const payPerHour = asNumber(item.pay_per_hour ?? item.recruiter_pay_per_hour);
    if (id == null || payPerHour == null) return [];

    const label = readJobLabel(item);
    return [
      {
        id,
        short_label: toShortJobTitle(label, asString(item.short_label) ?? asString(item.abbreviation)),
        label,
        configured: item.configured == null ? true : Boolean(item.configured),
        pay_per_hour: payPerHour,
      },
    ];
  });
}

function readExperienceLevels(
  value: unknown,
  jobs: ExperienceJobTitleFee[],
  rawJobs: unknown,
): FeeExperienceLevel[] {
  const levels = new Map<number, FeeExperienceLevel & { minYears: number | null; order: number }>();

  function add(raw: unknown, order: number) {
    if (!isRecord(raw)) return;
    const id = asNumber(raw.id);
    if (id == null) return;
    const name = asString(raw.name) ?? asString(raw.label);
    const minYears = asNumber(raw.min_years);
    const existing = levels.get(id);
    if (!existing) {
      levels.set(id, {
        id,
        name: name ?? `Level ${id}`,
        minYears,
        order,
      });
      return;
    }
    if (name && existing.name.startsWith("Level ")) existing.name = name;
    if (existing.minYears == null && minYears != null) existing.minYears = minYears;
  }

  if (Array.isArray(value)) {
    value.forEach((level, index) => add(level, index));
  }

  if (Array.isArray(rawJobs)) {
    for (const job of rawJobs) {
      if (!isRecord(job) || !Array.isArray(job.rates)) continue;
      for (const rate of job.rates) {
        if (!isRecord(rate) || !isRecord(rate.experience_level)) continue;
        add(rate.experience_level, levels.size);
      }
    }
  }

  for (const job of jobs) {
    for (const rate of job.rates) {
      if (!levels.has(rate.experience_level_id)) {
        levels.set(rate.experience_level_id, {
          id: rate.experience_level_id,
          name: `Level ${rate.experience_level_id}`,
          minYears: null,
          order: levels.size,
        });
      }
    }
  }

  return [...levels.values()]
    .sort((a, b) => {
      if (a.minYears != null && b.minYears != null && a.minYears !== b.minYears) {
        return a.minYears - b.minYears;
      }
      return a.order - b.order;
    })
    .map(({ id, name }) => ({ id, name }));
}

export function normalizeFeesSummary(
  payload: unknown,
  scope: Exclude<FeesSummaryScope, "all">,
): FeesSummaryData {
  const root = isRecord(payload) ? payload : {};

  if (scope === "instant") {
    const section = isRecord(root.instant) ? root.instant : root;
    const jobs = readInstantJobs(section.job_titles ?? root.job_titles);
    return { scope: "instant", job_titles: jobs };
  }

  const section = isRecord(root.default) ? root.default : root;
  const rawJobs = section.job_titles ?? root.job_titles;
  const jobTitles = readStandardJobs(rawJobs);
  const hasCustomRates =
    Boolean(section.has_recruiter_specific_fees ?? root.has_custom_rates) ||
    jobTitles.some((job) => job.has_custom_rates);

  return {
    scope: "default",
    experience_levels: readExperienceLevels(
      root.experience_levels ?? section.experience_levels,
      jobTitles,
      rawJobs,
    ),
    job_titles: jobTitles,
    has_custom_rates: hasCustomRates,
  };
}
