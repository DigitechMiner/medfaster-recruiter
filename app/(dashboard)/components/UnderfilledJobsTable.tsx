"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import {
  EmptyState,
  StatusBadge,
} from "@/app/jobs/[id]/components/JobDetailDataView";
import { useDashboardUnderfilledJobs } from "@/hooks/useDashboard";
import type { UnderfilledJob } from "@/features/dashboard";
import type { MetadataValueOption } from "@/features/common";
import {
  resolveCanadianProvinceLabel,
  useMetadataStore,
} from "@/stores/metadataStore";
import { formatDate } from "@/app/jobs/components/helper";

const HEADERS = [
  "Job title",
  "Location",
  "Start date",
  "Hires",
  "Status",
  "",
];

const PER_PAGE_OPTIONS = [10, 20, 50];

const TD = "px-4 py-3.5 text-sm text-gray-700 border-b border-gray-50";

function formatLocation(
  provinces: readonly MetadataValueOption[],
  job: UnderfilledJob,
): string {
  const provinceLabel = resolveCanadianProvinceLabel(provinces, job.province);
  const line = [job.street, job.city, provinceLabel || job.province]
    .filter(Boolean)
    .join(", ");
  return line || "—";
}

type UnderfilledJobsTableProps = {
  embedded?: boolean;
};

export function UnderfilledJobsTable({
  embedded = false,
}: UnderfilledJobsTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const provinceOptions = useMetadataStore((s) => s.provinceOptions);

  const { data, isLoading, isError, error, refetch } =
    useDashboardUnderfilledJobs(page, perPage);

  const jobs = data?.jobs ?? [];
  const total = data?.pagination.total ?? 0;

  const tableBody = isError ? (
    <div className="px-6 py-10 text-center text-sm text-red-600">
      {error instanceof Error ? error.message : "Failed to load jobs"}
    </div>
  ) : (
    <>
      <DataTable headers={HEADERS} minWidthClassName="min-w-[760px]">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td colSpan={6} className={TD}>
                <div className="h-4 w-3/4 max-w-md rounded-md bg-gray-200 animate-pulse" />
              </td>
            </tr>
          ))
        ) : jobs.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-4 py-12">
              <EmptyState
                title="No underfilled jobs"
                description="When jobs need more hires to meet your targets, they will appear here."
              />
            </td>
          </tr>
        ) : (
          jobs.map((job) => (
            <tr
              key={job.job_id}
              className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors cursor-pointer group"
              onClick={() => router.push(`/jobs/${job.job_id}`)}
            >
              <td className={`${TD} font-medium text-gray-900`}>
                {job.job_title}
              </td>
              <td className={`${TD} text-gray-600`}>
                {formatLocation(provinceOptions, job)}
              </td>
              <td className={`${TD} text-gray-600 whitespace-nowrap`}>
                {formatDate(job.start_date)}
              </td>
              <td className={TD}>
                <span className="font-semibold text-gray-900 tabular-nums">
                  {job.no_of_hires_hired}
                </span>
                <span className="text-gray-400"> / </span>
                <span className="text-gray-600 tabular-nums">
                  {job.no_of_hires_required}
                </span>
                <span className="text-gray-400 text-xs ml-1">hired</span>
              </td>
              <td className={TD}>
                <StatusBadge value={job.status} />
              </td>
              <td className={`${TD} text-right`}>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#F4781B] group-hover:underline">
                  View
                  <ChevronRight className="w-4 h-4" aria-hidden />
                </span>
              </td>
            </tr>
          ))
        )}
      </DataTable>

      {!isLoading && jobs.length > 0 && (
        <PaginationFooter
          page={page}
          totalItems={total}
          perPage={perPage}
          onPageChange={setPage}
          itemLabel="jobs"
          perPageOptions={PER_PAGE_OPTIONS}
          onPerPageChange={(next) => {
            setPerPage(next);
            setPage(1);
          }}
        />
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="min-h-0">
        {isError && (
          <div className="flex justify-end px-4 sm:px-6 pb-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="text-xs font-medium text-[#F4781B] hover:underline"
            >
              Retry
            </button>
          </div>
        )}
        {tableBody}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Underfilled jobs
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Roles that still need hires against your targets
          </p>
        </div>
        {isError && (
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-medium text-[#F4781B] hover:underline"
          >
            Retry
          </button>
        )}
      </div>

      {tableBody}
    </div>
  );
}
