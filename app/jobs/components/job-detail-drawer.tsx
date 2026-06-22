"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getRecruiterJobInfo } from "@/features/jobs";
import type { JobInfoNeighborhood, JobInfoShiftTemplate, RecruiterJobInfo } from "@/features/jobs";
import { resolveCanadianProvinceLabel, useMetadataStore } from "@/stores/metadataStore";
import type { JobListItem } from "@/types";
import {
  formatBudget,
  formatDate,
  formatJobTitleDisplay,
  formatJobTypeLabel,
  formatListingStatus,
  formatShiftPopoverLine,
  formatShiftTypeLabel,
  formatUrgencyLabel,
  getListingStatusBadgeClass,
  getShiftTypeBadgeClass,
  jobBadgeDisplayMap,
  jobBadgeVariantMap,
  DEFAULT_JOB_BADGE_CLASS,
} from "./helper";

const ANIM_DURATION = 200;

const INSTANT_NEIGHBORHOOD_LABELS = [
  "Name",
  "Type",
  "Direct Number",
  "Instant Job Type",
  "Visibility",
  "Public Radius",
  "Expires At",
] as const;

interface JobDetailDrawerProps {
  job: JobListItem | null;
  onClose: () => void;
}

function SkeletonValue({ className = "h-4 w-28" }: { className?: string }) {
  return <div className={`mt-0.5 animate-pulse rounded bg-gray-200 ${className}`} />;
}

function DetailField({
  label,
  value,
  loading = false,
}: {
  label: string;
  value?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      {loading ? (
        <SkeletonValue />
      ) : (
        <div className="mt-0.5 text-sm text-gray-800 break-words">{value ?? "—"}</div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wide text-[#F4781B] border-b border-orange-100 pb-2 mb-3">
      {children}
    </h3>
  );
}

function formatChipList(items: string[]): React.ReactNode {
  if (!items.length) return "—";
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700"
        >
          {item}
        </span>
      ))}
    </span>
  );
}

function formatYesNo(value: boolean | null | undefined): string {
  if (value == null) return "—";
  return value ? "Yes" : "No";
}

function hasNeighborhoodData(neighborhood?: JobInfoNeighborhood | null): neighborhood is JobInfoNeighborhood {
  return Boolean(neighborhood && Object.keys(neighborhood).length > 0);
}

function ShiftsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }, (_, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-100 bg-gray-50/60 px-3.5 py-3 space-y-2"
        >
          <SkeletonValue className="h-4 w-32" />
          <SkeletonValue className="h-3.5 w-48" />
          <div className="grid grid-cols-2 gap-3">
            <SkeletonValue className="h-3 w-20" />
            <SkeletonValue className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function JobDetailDrawer({ job, onClose }: JobDetailDrawerProps) {
  const router = useRouter();
  const jobTypeOptions = useMetadataStore((state) => state.jobTypeOptions);
  const provinceOptions = useMetadataStore((state) => state.provinceOptions);
  const [isClosing, setIsClosing] = useState(false);
  const [jobInfo, setJobInfo] = useState<RecruiterJobInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, ANIM_DURATION);
  }, [onClose]);

  useEffect(() => {
    if (!job) {
      setJobInfo(null);
      setInfoError(null);
      setInfoLoading(false);
      return;
    }

    let cancelled = false;
    setInfoLoading(true);
    setInfoError(null);
    setJobInfo(null);

    getRecruiterJobInfo(job.id)
      .then((data) => {
        if (!cancelled) setJobInfo(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setInfoError(err instanceof Error ? err.message : "Failed to load job info");
        }
      })
      .finally(() => {
        if (!cancelled) setInfoLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [job]);

  useEffect(() => {
    if (!job) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [job, handleClose]);

  if (!job) return null;

  const listingStatus = formatListingStatus(job);
  const isInstantJob = job.job_urgency === "INSTANT";
  const isNormalJob = job.job_urgency === "NORMAL";
  const isClosed = job.status === "CLOSED" || job.status === "COMPLETED";
  const jobTitle = formatJobTitleDisplay(jobInfo?.job_title ?? job.job_title);
  const jobTypeLabel = formatJobTypeLabel(jobInfo?.job_type ?? job.job_type, jobTypeOptions);
  const workforceCount = jobInfo?.workforce_count ?? 0;
  const hiresRequired = jobInfo?.no_of_hires_required ?? 0;
  const applicationCount = jobInfo?.application_count ?? job.application_count ?? 0;
  const payRate = formatBudget(jobInfo?.recruiter_pay_per_hour_cents);
  const shiftTemplates = jobInfo?.shift_templates ?? [];
  const specializations = jobInfo?.specializations ?? [];
  const qualifications = jobInfo?.qualifications ?? [];
  const neighborhood = jobInfo?.neighborhood;
  const provinceLabel = resolveCanadianProvinceLabel(provinceOptions, jobInfo?.province);
  const showRequirements =
    isNormalJob && (infoLoading || specializations.length > 0 || qualifications.length > 0);
  const showShifts = infoLoading || shiftTemplates.length > 0;
  const showNeighborhood =
    isInstantJob && (infoLoading || hasNeighborhoodData(neighborhood));

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-[1px]"
        style={{
          animation: isClosing
            ? `job-drawer-fade-out ${ANIM_DURATION}ms ease forwards`
            : `job-drawer-fade-in ${ANIM_DURATION}ms ease forwards`,
        }}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        className="fixed top-0 right-0 bottom-0 z-[71] w-full sm:w-[480px] bg-white flex flex-col shadow-2xl border-l border-gray-200"
        style={{
          animation: isClosing
            ? `job-drawer-slide-out ${ANIM_DURATION}ms cubic-bezier(0.4, 0, 1, 1) forwards`
            : `job-drawer-slide-in ${ANIM_DURATION}ms cubic-bezier(0, 0, 0.2, 1) forwards`,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <style>{`
          @keyframes job-drawer-slide-in  { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes job-drawer-slide-out { from { transform: translateX(0); }    to { transform: translateX(100%); } }
          @keyframes job-drawer-fade-in   { from { opacity: 0; } to { opacity: 1; } }
          @keyframes job-drawer-fade-out  { from { opacity: 1; } to { opacity: 0; } }
        `}</style>

        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400">Job Preview</p>
            <h2 className="text-lg font-bold text-gray-900 mt-0.5 leading-snug">{jobTitle}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge
                className={`px-2.5 py-0.5 border-transparent text-xs font-medium ${getListingStatusBadgeClass(listingStatus)}`}
              >
                {listingStatus}
              </Badge>
              {job.job_urgency && (
                <Badge className="px-2.5 py-0.5 border-transparent text-xs font-medium bg-orange-50 text-[#F4781B]">
                  {formatUrgencyLabel(job)}
                </Badge>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 shrink-0"
            aria-label="Close job preview"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {infoError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {infoError}
            </div>
          )}

          <section>
            <SectionTitle>Job Information</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField
                label="Job Title"
                loading={infoLoading}
                value={formatJobTitleDisplay(jobInfo?.job_title)}
              />
              <DetailField label="Department" loading={infoLoading} value={jobInfo?.department} />
              <DetailField label="Job Type" loading={infoLoading} value={jobTypeLabel} />
              <DetailField label="City" loading={infoLoading} value={jobInfo?.city} />
              <DetailField
                label="Province"
                loading={infoLoading}
                value={provinceLabel || jobInfo?.province}
              />
              <DetailField label="Pay Rate" loading={infoLoading} value={payRate} />
              <DetailField
                label="Status"
                value={
                  <Badge
                    className={`px-2 py-0.5 border-transparent text-xs font-medium ${jobBadgeVariantMap[job.status] ?? DEFAULT_JOB_BADGE_CLASS}`}
                  >
                    {jobBadgeDisplayMap[job.status] ?? job.status}
                  </Badge>
                }
              />
              {isNormalJob && (
                <>
                  <DetailField
                    label="Employment Tenure"
                    loading={infoLoading}
                    value={
                      jobInfo?.employment_tenure
                        ? formatShiftTypeLabel(jobInfo.employment_tenure)
                        : undefined
                    }
                  />
                  <DetailField
                    label="AI Interview"
                    loading={infoLoading}
                    value={formatYesNo(jobInfo?.ai_interview)}
                  />
                </>
              )}
            </div>
          </section>

          {showRequirements && (
            <section>
              <SectionTitle>Requirements</SectionTitle>
              <div className="grid grid-cols-1 gap-4">
                <DetailField
                  label="Specializations"
                  loading={infoLoading}
                  value={formatChipList(specializations)}
                />
                <DetailField
                  label="Qualifications"
                  loading={infoLoading}
                  value={formatChipList(qualifications)}
                />
              </div>
            </section>
          )}

          <section>
            <SectionTitle>Hiring</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField label="Required Hires" loading={infoLoading} value={hiresRequired} />
              <DetailField
                label="Applications Received"
                loading={infoLoading}
                value={applicationCount}
              />
              <DetailField label="Workforce Assigned" loading={infoLoading} value={workforceCount} />
              <DetailField
                label="Hiring Progress"
                loading={infoLoading}
                value={`${workforceCount} / ${hiresRequired}`}
              />
            </div>
          </section>

          {showShifts && (
            <section>
              <SectionTitle>Shifts</SectionTitle>
              {infoLoading ? (
                <ShiftsSkeleton />
              ) : (
                <div className="space-y-3">
                  {shiftTemplates.map((shift: JobInfoShiftTemplate) => (
                    <div
                      key={shift.id}
                      className="rounded-xl border border-gray-100 bg-gray-50/60 px-3.5 py-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{shift.shift_name}</span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getShiftTypeBadgeClass(formatShiftTypeLabel(shift.shift_type))}`}
                        >
                          {formatShiftTypeLabel(shift.shift_type)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-gray-600">{formatShiftPopoverLine(shift)}</p>
                      <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-gray-500">
                        {shift.duration_hours != null && (
                          <span>Duration: {shift.duration_hours}h</span>
                        )}
                        {shift.break_minutes != null && (
                          <span>Break: {shift.break_minutes} min</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {showNeighborhood && (
            <section>
              <SectionTitle>Neighborhood</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoLoading ? (
                  INSTANT_NEIGHBORHOOD_LABELS.map((label) => (
                    <DetailField key={label} label={label} loading />
                  ))
                ) : (
                  <>
                    {neighborhood?.neighborhood_name != null && (
                      <DetailField label="Name" value={neighborhood.neighborhood_name} />
                    )}
                    {neighborhood?.neighborhood_type != null && (
                      <DetailField
                        label="Type"
                        value={formatShiftTypeLabel(neighborhood.neighborhood_type)}
                      />
                    )}
                    {neighborhood?.direct_number != null && (
                      <DetailField label="Direct Number" value={neighborhood.direct_number} />
                    )}
                    {neighborhood?.instant_job_type != null && (
                      <DetailField
                        label="Instant Job Type"
                        value={formatShiftTypeLabel(neighborhood.instant_job_type)}
                      />
                    )}
                    {neighborhood?.is_public != null && (
                      <DetailField
                        label="Visibility"
                        value={neighborhood.is_public ? "Public" : "Private"}
                      />
                    )}
                    {neighborhood?.is_public && neighborhood.public_radius_km != null && (
                      <DetailField
                        label="Public Radius"
                        value={`${neighborhood.public_radius_km} km`}
                      />
                    )}
                    {neighborhood?.expires_at != null && (
                      <DetailField
                        label="Expires At"
                        value={formatDate(neighborhood.expires_at)}
                      />
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          <section>
            <SectionTitle>Timeline</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailField
                label="Start Date"
                loading={infoLoading}
                value={formatDate(jobInfo?.start_date)}
              />
              <DetailField
                label="End Date"
                loading={infoLoading}
                value={formatDate(jobInfo?.end_date)}
              />
              {job.created_at && (
                <DetailField label="Created" value={formatDate(job.created_at)} />
              )}
            </div>
          </section>

          {isClosed && (job.closed_reason || job.recruiter_close_note) && (
            <section>
              <SectionTitle>Closure Information</SectionTitle>
              <div className="grid grid-cols-1 gap-4">
                <DetailField label="Closed Reason" value={job.closed_reason} />
                <DetailField label="Close Note" value={job.recruiter_close_note} />
              </div>
            </section>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-100 px-5 py-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => router.push(`/jobs/${job.id}`)}
            className="flex-1 min-w-[120px] rounded-xl bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-semibold px-4 py-2.5 transition-colors"
          >
            Open Full Page
          </button>
          <button
            type="button"
            onClick={() => router.push(`/jobs/${job.id}?tab=applications`)}
            className="flex-1 min-w-[120px] rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 px-4 py-2.5 hover:bg-gray-50 transition-colors"
          >
            Applications
          </button>
        </div>
      </div>
    </>
  );
}
