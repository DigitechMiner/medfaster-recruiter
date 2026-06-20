"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Eye, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/table/DataTable";
import { resolveCanadianProvinceLabel, useMetadataStore } from "@/stores/metadataStore";
import type { JobListItem } from "@/types";
import {
  DEFAULT_JOB_BADGE_CLASS,
  JOB_TABLE_HEADERS,
  formatApplicantLabel,
  formatJobLocationLine,
  formatJobTitleDisplay,
  formatJobTypeLabel,
  formatScheduleRange,
  getFilledPositions,
  getJobShiftPopoverLines,
  getJobTypeBadgeClass,
  getRecruiterPayDisplay,
  getRequiredPositions,
  getShiftCount,
  getStatusSubLabel,
  hasAiInterview,
  jobBadgeDisplayMap,
  jobBadgeVariantMap,
} from "./helper";

interface TableViewProps {
  jobs: JobListItem[];
  onJobClick: (jobId: JobListItem["id"]) => void;
}

function JobStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={`px-2.5 py-0.5 border-transparent text-xs font-medium ${jobBadgeVariantMap[status] ?? DEFAULT_JOB_BADGE_CLASS}`}
    >
      {jobBadgeDisplayMap[status] ?? status}
    </Badge>
  );
}

function ShiftScheduleCell({ job }: { job: JobListItem }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scheduleRange = formatScheduleRange(job);
  const shiftCount = getShiftCount(job);
  const shiftLines = getJobShiftPopoverLines(job);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  if (!scheduleRange && shiftCount === 0) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-col gap-0.5">
        {scheduleRange && (
          <span className="text-sm text-gray-800 whitespace-nowrap">{scheduleRange}</span>
        )}
        {shiftCount > 0 && (
          <span className="text-xs text-gray-500">
            {shiftCount} {shiftCount === 1 ? "Shift" : "Shifts"}
          </span>
        )}
        {shiftLines.length > 0 && (
          <button
            type="button"
            className="text-xs font-medium text-[#F4781B] hover:underline w-fit text-left"
            onClick={(event) => {
              event.stopPropagation();
              setOpen((prev) => !prev);
            }}
          >
            View Shifts
          </button>
        )}
      </div>

      {open && shiftLines.length > 0 && (
        <div
          className="absolute left-0 top-full z-20 mt-1 min-w-[220px] rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Shifts
          </p>
          <ul className="flex flex-col gap-1.5">
            {shiftLines.map((line, index) => (
              <li key={`${job.id}-popover-shift-${index}`} className="text-xs text-gray-700">
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

type JobAction = {
  label: string;
  onClick: () => void;
  destructive?: boolean;
};

function JobActionsMenu({
  jobId,
  status,
  onView,
}: {
  jobId: string;
  status: string;
  onView: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const actions: JobAction[] = [
    {
      label: "View Details",
      onClick: () => {
        setOpen(false);
        onView();
      },
    },
    {
      label: "Applications",
      onClick: () => {
        setOpen(false);
        router.push(`/jobs/${jobId}?tab=applications`);
      },
    },
    {
      label: "Edit",
      onClick: () => {
        setOpen(false);
        router.push(`/jobs/${jobId}`);
      },
    },
    {
      label: "Duplicate",
      onClick: () => {
        setOpen(false);
        router.push(`/jobs/${jobId}`);
      },
    },
  ];

  if (status === "OPEN" || status === "UPCOMING" || status === "ACTIVE") {
    actions.push({
      label: "Close",
      destructive: true,
      onClick: () => {
        setOpen(false);
        router.push(`/jobs/${jobId}`);
      },
    });
  }

  return (
    <div ref={menuRef} className="relative flex items-center gap-1">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-orange-50 hover:text-[#F4781B] transition-colors"
        title="View job"
        onClick={(event) => {
          event.stopPropagation();
          onView();
        }}
      >
        <Eye size={16} />
        <span className="hidden sm:inline">View</span>
      </button>
      <button
        type="button"
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label="More actions"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                action.destructive ? "text-red-600 hover:bg-red-50" : "text-gray-700"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                action.onClick();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ExpandedJobDetails({
  job,
  provinceLabel,
  jobTypeLabel,
}: {
  job: JobListItem;
  provinceLabel: string;
  jobTypeLabel: string;
}) {
  const shiftLines = getJobShiftPopoverLines(job);
  const recruiterPay = getRecruiterPayDisplay(job);
  const payLabel = job.total_recruiter_pay_cents != null ? "Recruiter Pay" : "Pay Rate";

  return (
    <div className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Department</p>
        <p className="mt-0.5 text-gray-800">{job.department ?? "—"}</p>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Location</p>
        <p className="mt-0.5 text-gray-800">
          {[job.city, provinceLabel].filter(Boolean).join(", ") || "—"}
        </p>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Job Type</p>
        <p className="mt-0.5 text-gray-800">{jobTypeLabel}</p>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{payLabel}</p>
        <p className="mt-0.5 text-gray-800">{recruiterPay}</p>
      </div>
      <div className="sm:col-span-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Shifts</p>
        {shiftLines.length > 0 ? (
          <ul className="mt-1 flex flex-col gap-1">
            {shiftLines.map((line, index) => (
              <li key={`${job.id}-expanded-shift-${index}`} className="text-gray-700">
                {line}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-0.5 text-gray-800">—</p>
        )}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">AI Interview</p>
        <p className="mt-0.5 text-gray-800">{hasAiInterview(job) ? "Yes" : "No"}</p>
      </div>
      {job.workforce_count != null && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Workforce</p>
          <p className="mt-0.5 text-gray-800">{job.workforce_count}</p>
        </div>
      )}
      {job.remaining_hires != null && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Remaining Hires</p>
          <p className="mt-0.5 text-gray-800">{job.remaining_hires}</p>
        </div>
      )}
    </div>
  );
}

export function TableView({ jobs, onJobClick }: TableViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const provinceOptions = useMetadataStore((state) => state.provinceOptions);
  const jobTypeOptions = useMetadataStore((state) => state.jobTypeOptions);

  const toggleExpanded = (jobId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  return (
    <DataTable
      headers={JOB_TABLE_HEADERS}
      minWidthClassName="min-w-[880px]"
      headerRowClassName="bg-[#FEF3E9]"
    >
      {jobs.map((job) => {
        const isExpanded = expandedIds.has(job.id);
        const provinceLabel = resolveCanadianProvinceLabel(provinceOptions, job.province);
        const jobTypeLabel = formatJobTypeLabel(job.job_type, jobTypeOptions);
        const statusSubLabel = getStatusSubLabel(job);
        const hiresRequired = getRequiredPositions(job);
        const hiresFilled = getFilledPositions(job);

        return (
          <Fragment key={job.id}>
            <tr
              className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors cursor-pointer"
              onClick={() => onJobClick(job.id)}
            >
              <td className="px-4 py-3.5 align-top">
                <button
                  type="button"
                  className="flex items-start gap-2 text-left"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleExpanded(job.id);
                  }}
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? "Collapse job details" : "Expand job details"}
                >
                  {isExpanded ? (
                    <ChevronDown size={16} className="mt-0.5 shrink-0 text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="mt-0.5 shrink-0 text-gray-400" />
                  )}
                  <span className="font-semibold text-gray-900">
                    {formatJobTitleDisplay(job.job_title)}
                  </span>
                </button>
              </td>

              <td className="px-4 py-3.5 align-top">
                <div className="flex flex-col gap-0.5 text-sm">
                  <span className="text-gray-800">{formatApplicantLabel(job.application_count)}</span>
                  <span className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{hiresFilled}</span>
                    /{hiresRequired} Filled
                  </span>
                </div>
              </td>

              <td className="px-4 py-3.5 align-top" onClick={(event) => event.stopPropagation()}>
                <ShiftScheduleCell job={job} />
              </td>

              <td className="px-4 py-3.5 align-top">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getJobTypeBadgeClass(job.job_type)}`}
                >
                  {jobTypeLabel}
                </span>
              </td>

              <td className="px-4 py-3.5 align-top">
                <div className="flex flex-col gap-1">
                  <JobStatusBadge status={job.status} />
                  {statusSubLabel && (
                    <span className="text-xs text-gray-500">{statusSubLabel}</span>
                  )}
                </div>
              </td>

              <td className="px-4 py-3.5 align-top" onClick={(event) => event.stopPropagation()}>
                <JobActionsMenu
                  jobId={job.id}
                  status={job.status}
                  onView={() => onJobClick(job.id)}
                />
              </td>
            </tr>

            {isExpanded && (
              <tr className="border-b border-gray-100 bg-[#FFFBF7]">
                <td colSpan={JOB_TABLE_HEADERS.length} className="px-4 py-0">
                  <div className="border-t border-orange-100/80">
                    <p className="px-0 pt-3 text-xs text-gray-500">
                      {formatJobLocationLine(job, provinceLabel)}
                    </p>
                    <ExpandedJobDetails
                      job={job}
                      provinceLabel={provinceLabel}
                      jobTypeLabel={jobTypeLabel}
                    />
                  </div>
                </td>
              </tr>
            )}
          </Fragment>
        );
      })}
    </DataTable>
  );
}
