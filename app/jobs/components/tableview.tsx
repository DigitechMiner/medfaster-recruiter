"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/table/DataTable";
import { resolveCanadianProvinceLabel, useMetadataStore } from "@/stores/metadataStore";
import type { JobListItem } from "@/types";
import {
  JOB_TABLE_HEADERS,
  JobsEmptyView,
  JobsErrorView,
  JobsTableBodySkeleton,
  formatDate,
  formatJobTitleDisplay,
  formatListingStatus,
  formatLocationCityProvince,
  getFilledPositions,
  getJobShiftTypeLabels,
  getListingStatusBadgeClass,
  getRequiredPositions,
  getShiftTypeBadgeClass,
} from "./helper";

interface TableViewProps {
  jobs: JobListItem[];
  loading?: boolean;
  error?: string | null;
  onJobPreview: (job: JobListItem) => void;
}

function ShiftBadges({ job }: { job: JobListItem }) {
  const labels = getJobShiftTypeLabels(job);

  if (labels.length === 0) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((label) => (
        <span
          key={`${job.id}-${label}`}
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${getShiftTypeBadgeClass(label)}`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function TableView({ jobs, loading = false, error = null, onJobPreview }: TableViewProps) {
  const router = useRouter();
  const provinceOptions = useMetadataStore((state) => state.provinceOptions);

  const goToDetailsPage = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  return (
    <DataTable
      headers={JOB_TABLE_HEADERS}
      minWidthClassName="min-w-[1080px]"
      headerRowClassName="bg-[#FEF3E9]"
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
          const provinceLabel = resolveCanadianProvinceLabel(provinceOptions, job.province);
          const listingStatus = formatListingStatus(job);
          const hiresRequired = getRequiredPositions(job);
          const hiresFilled = getFilledPositions(job);

          return (
            <tr
              key={job.id}
              className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors cursor-pointer"
              onClick={() => onJobPreview(job)}
            >
              <td className="px-4 py-3 align-middle">
                <span className="font-semibold text-gray-900 text-sm">
                  {formatJobTitleDisplay(job.job_title)}
                </span>
              </td>

              <td className="px-4 py-3 align-middle">
                <ShiftBadges job={job} />
              </td>

              <td className="px-4 py-3 align-middle text-sm text-gray-700 whitespace-nowrap">
                {formatDate(job.start_date)}
              </td>

              <td className="px-4 py-3 align-middle text-sm text-gray-700 whitespace-nowrap">
                {formatDate(job.end_date)}
              </td>

              <td className="px-4 py-3 align-middle text-sm text-gray-700 whitespace-nowrap">
                {formatLocationCityProvince(job, provinceLabel)}
              </td>

              <td className="px-4 py-3 align-middle text-sm tabular-nums whitespace-nowrap">
                <span className="font-medium text-gray-800">{hiresFilled}</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{hiresRequired}</span>
              </td>

              <td className="px-4 py-3 align-middle text-sm text-gray-800 tabular-nums">
                {job.application_count}
              </td>

              <td className="px-4 py-3 align-middle">
                <Badge
                  className={`px-2.5 py-0.5 border-transparent text-xs font-medium ${getListingStatusBadgeClass(listingStatus)}`}
                >
                  {listingStatus}
                </Badge>
              </td>

              <td className="px-4 py-3 align-middle text-sm text-gray-500 whitespace-nowrap">
                {formatDate(job.created_at)}
              </td>

              <td className="px-4 py-3 align-middle" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#F4781B] hover:bg-orange-50 transition-colors whitespace-nowrap"
                  onClick={() => goToDetailsPage(job.id)}
                >
                  Details
                </button>
              </td>
            </tr>
          );
        })
      )}
    </DataTable>
  );
}
