"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DataTable } from "@/components/table/DataTable";
import {
  resolveCanadianProvinceLabel,
  resolveCanadianCityLabel,
  useMetadataStore,
} from "@/stores/metadataStore";
import type { JobListItem } from "@/types";
import {
  JOB_TABLE_HEADERS,
  JobsEmptyView,
  JobsErrorView,
  JobsTableBodySkeleton,
  formatDateRangeShort,
  formatJobTitleDisplay,
  formatListingStatus,
  formatLocationCityProvince,
  getFilledPositions,
  getJobShiftTypeLabels,
  getListingStatusDotClass,
  getRequiredPositions,
  getShiftTypeBadgeClass,
} from "./helper";

interface TableViewProps {
  jobs: JobListItem[];
  loading?: boolean;
  error?: string | null;
  onJobPreview: (job: JobListItem) => void;
}

function JobPrimaryCell({
  job,
  location,
}: {
  job: JobListItem;
  location: string;
}) {
  const shiftLabels = getJobShiftTypeLabels(job);

  return (
    <div className="min-w-0">
      <p className="font-semibold text-gray-900 text-sm leading-snug">
        {formatJobTitleDisplay(job.job_title)}
      </p>
      {location !== "—" ? (
        <p className="mt-1 text-xs text-gray-500">{location}</p>
      ) : null}
      {shiftLabels.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {shiftLabels.map((label) => (
            <span
              key={`${job.id}-${label}`}
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${getShiftTypeBadgeClass(label)}`}
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HiresCell({
  filled,
  required,
}: {
  filled: number;
  required: number;
}) {
  const fillPercent =
    required > 0 ? Math.min((filled / required) * 100, 100) : 0;

  return (
    <div className="min-w-[72px]">
      <span className="text-sm tabular-nums whitespace-nowrap">
        <span className="font-medium text-gray-800">{filled}</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">{required}</span>
      </span>
      <div className="mt-1.5 h-1 w-full max-w-[80px] rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-[#F4781B] transition-all"
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
}

function StatusCell({ status }: { status: ReturnType<typeof formatListingStatus> }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 whitespace-nowrap">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${getListingStatusDotClass(status)}`}
      />
      {status}
    </span>
  );
}

export function TableView({
  jobs,
  loading = false,
  error = null,
  onJobPreview,
}: TableViewProps) {
  const router = useRouter();
  const provinceOptions = useMetadataStore((state) => state.provinceOptions);

  const goToDetailsPage = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  return (
    <DataTable
      headers={JOB_TABLE_HEADERS}
      minWidthClassName="min-w-[720px]"
      headerRowClassName="border-b border-gray-100"
      columnClassNames={[
        "min-w-[240px] w-[36%] whitespace-normal",
        "",
        "",
        "",
        "",
        "w-10",
      ]}
    >
      {loading ? (
        <JobsTableBodySkeleton />
      ) : error ? (
        <tr>
          <td colSpan={JOB_TABLE_HEADERS.length} className="px-4 py-8">
            <JobsErrorView error={error} />
          </td>
        </tr>
      ) : jobs.length === 0 ? (
        <tr>
          <td colSpan={JOB_TABLE_HEADERS.length} className="px-4 py-8">
            <JobsEmptyView />
          </td>
        </tr>
      ) : (
        jobs.map((job) => {
          const provinceLabel = resolveCanadianProvinceLabel(
            provinceOptions,
            job.province,
          );
          const cityLabel = resolveCanadianCityLabel(
            provinceOptions,
            job.province,
            job.city,
          );
          const location = formatLocationCityProvince(
            job,
            provinceLabel,
            cityLabel,
          );
          const listingStatus = formatListingStatus(job);
          const hiresRequired = getRequiredPositions(job);
          const hiresFilled = getFilledPositions(job);
          const schedule = formatDateRangeShort(job);

          return (
            <tr
              key={job.id}
              className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/80 transition-colors cursor-pointer group"
              onClick={() => onJobPreview(job)}
            >
              <td className="px-4 py-2.5 align-middle min-w-[240px] w-[36%]">
                <JobPrimaryCell job={job} location={location} />
              </td>

              <td className="px-4 py-2.5 align-middle text-sm text-gray-600 whitespace-nowrap tabular-nums">
                {schedule ?? "—"}
              </td>

              <td className="px-4 py-2.5 align-middle">
                <HiresCell filled={hiresFilled} required={hiresRequired} />
              </td>

              <td className="px-4 py-2.5 align-middle text-sm text-gray-800 tabular-nums">
                {job.application_count}
              </td>

              <td className="px-4 py-2.5 align-middle">
                <StatusCell status={listingStatus} />
              </td>

              <td
                className="px-2 py-2.5 align-middle text-right"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  aria-label="View job details"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-orange-50 hover:text-[#F4781B] group-hover:text-gray-500"
                  onClick={() => goToDetailsPage(job.id)}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </td>
            </tr>
          );
        })
      )}
    </DataTable>
  );
}
