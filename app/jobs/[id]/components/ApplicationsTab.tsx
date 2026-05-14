"use client";

import { useState } from "react";
import Image from "next/image";
import { Briefcase, LayoutGrid, List, MapPin, Star } from "lucide-react";
import { DataTable } from "@/components/table/DataTable";
import { PaginationFooter } from "@/components/table/PaginationFooter";
import { useJobApplications } from "@/hooks/useJobData";
import type { ApplicationStatus } from "@/types";
import { EmptyState, LoadingRows, StatusBadge } from "./JobDetailDataView";
import { formatDate, formatLabel } from "./job-detail-helpers";

const APPLICATION_LIMIT = 10;
const APPLICATION_STATUSES: ApplicationStatus[] = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEWING",
  "INTERVIEWED",
  "HIRE",
  "REJECTED",
  "ACCEPTED",
  "CANCELLED",
];

type ApplicationsTabProps = {
  jobId: string;
};

export function ApplicationsTab({ jobId }: ApplicationsTabProps) {
  const [applicationPage, setApplicationPage] = useState(1);
  const [status, setStatus] = useState<ApplicationStatus | "ALL">("ALL");
  const [view, setView] = useState<"grid" | "list">("list");
  const {
    applications,
    isLoading,
    error,
  } = useJobApplications({
    job_id: jobId,
    status: status === "ALL" ? undefined : status,
    page: applicationPage,
    limit: APPLICATION_LIMIT,
  });
  const applicationItems = applications?.applications ?? [];
  const pagination = applications?.pagination;
  const total = pagination?.total ?? 0;
  const perPage = pagination?.limit ?? APPLICATION_LIMIT;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const renderPagination = () =>
    totalPages > 1 ? (
      <PaginationFooter
        page={applicationPage}
        totalItems={total}
        perPage={perPage}
        onPageChange={setApplicationPage}
        itemLabel="applications"
        className="flex items-center justify-between bg-[#FEF3E9] px-4 py-3 text-sm text-gray-600 border-t border-gray-200"
      />
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Applications</p>
          <p className="text-xs text-gray-400">Filter candidates by application status.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ApplicationStatus | "ALL");
              setApplicationPage(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-[#F4781B]"
          >
            <option value="ALL">All Status</option>
            {APPLICATION_STATUSES.map((applicationStatus) => (
              <option key={applicationStatus} value={applicationStatus}>
                {applicationStatus.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`p-2.5 transition-colors ${
                view === "grid" ? "bg-orange-50 text-[#F4781B]" : "text-gray-400 hover:bg-gray-50"
              }`}
              aria-pressed={view === "grid"}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`p-2.5 transition-colors ${
                view === "list" ? "bg-orange-50 text-[#F4781B]" : "text-gray-400 hover:bg-gray-50"
              }`}
              aria-pressed={view === "list"}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingRows />
      ) : error ? (
        <EmptyState title="Unable to load applications" description={error} />
      ) : applicationItems.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Candidates who apply for this job will appear here."
        />
      ) : view === "grid" ? (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 p-4">
            {applicationItems.map((application) => {
              const candidate = application.candidate;
              const candidateName =
                candidate?.full_name ||
                [candidate?.first_name, candidate?.last_name].filter(Boolean).join(" ") ||
                "Unknown candidate";
              const initials = candidateName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const department =
                candidate?.departments?.length
                  ? candidate.departments.join(", ")
                  : candidate?.department;
              const location =
                [candidate?.city, candidate?.state]
                  .filter(Boolean)
                  .map((value) => formatLabel(value))
                  .join(", ") || "N/A";
              const score = candidate?.job_interview_score ?? candidate?.best_ai_interview_score;

              return (
                <div
                  key={application.id}
                  className="flex min-w-[300px] flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all hover:border-orange-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge value={application.status} />
                    <span className="text-[11px] font-medium text-gray-400">
                      Applied {formatDate(application.created_at)}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-orange-50">
                      {candidate?.profile_image_url ? (
                        <Image
                          src={candidate.profile_image_url}
                          alt={candidateName}
                          width={44}
                          height={44}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#F4781B]">
                          {initials}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">{candidateName}</p>
                      <p className="mt-1 truncate text-xs font-semibold text-[#F4781B]">
                        {candidate?.job_title ?? "N/A"}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {department ?? "N/A"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-orange-50 px-2.5 py-1 text-center">
                      <p className="text-xs font-bold text-[#F4781B]">
                        {score != null ? score : "N/A"}
                      </p>
                      <p className="text-[10px] font-medium text-orange-400">Score</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Briefcase size={11} className="text-gray-400" />
                      {candidate?.experience ?? "N/A"}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} className="text-green-500" />
                      {location}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="inline-flex items-center gap-1">
                      <Star size={11} className="fill-yellow-400 text-yellow-400" />
                      {formatLabel(candidate?.work_eligibility)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {renderPagination()}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <DataTable
            headers={[
              "Candidate",
              "Designation",
              "Department",
              "Location",
              "Experience",
              "Score",
              "Eligibility",
              "Status",
              "Applied On",
            ]}
            minWidthClassName="min-w-[1080px]"
            headerRowClassName="border-b border-gray-200 bg-[#FEF3E9]"
          >
            {applicationItems.map((application) => {
              const candidate = application.candidate;
              const candidateName =
                candidate?.full_name ||
                [candidate?.first_name, candidate?.last_name].filter(Boolean).join(" ") ||
                "Unknown candidate";
              const initials = candidateName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const department =
                candidate?.departments?.length
                  ? candidate.departments.join(", ")
                  : candidate?.department;
              const location =
                [candidate?.city, candidate?.state]
                  .filter(Boolean)
                  .map((value) => formatLabel(value))
                  .join(", ") || "N/A";
              const score = candidate?.job_interview_score ?? candidate?.best_ai_interview_score;

              return (
                <tr key={application.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-orange-50">
                        {candidate?.profile_image_url ? (
                          <Image
                            src={candidate.profile_image_url}
                            alt={candidateName}
                            width={36}
                            height={36}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#F4781B]">
                            {initials}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 whitespace-nowrap">{candidateName}</p>
                        <p className="text-xs text-gray-400">{candidate?.id ?? "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-[#F4781B]">
                    {candidate?.job_title ?? "N/A"}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">{department ?? "N/A"}</td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{location}</td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                    {candidate?.experience ?? "N/A"}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                    {score != null ? `${score}/100` : "N/A"}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                    {formatLabel(candidate?.work_eligibility)}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge value={application.status} />
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                    {formatDate(application.created_at)}
                  </td>
                </tr>
              );
            })}
          </DataTable>
          {renderPagination()}
        </div>
      )}
    </div>
  );
}

