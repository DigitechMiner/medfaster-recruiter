import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/table/DataTable";
import type { JobListItem } from "@/types";
import {
  DEFAULT_JOB_BADGE_CLASS,
  JOB_TABLE_HEADERS,
  formatBudget,
  formatDate,
  formatTime,
  getInterviewLabel,
  jobBadgeDisplayMap,
  jobBadgeVariantMap,
} from "./helper";

interface TableViewProps {
  jobs: JobListItem[];
  onJobClick: (jobId: JobListItem["id"]) => void;
}

function JobBadge({ label }: { label: string }) {
  return (
    <Badge
      className={`px-3 py-1 border-transparent ${jobBadgeVariantMap[label] ?? DEFAULT_JOB_BADGE_CLASS}`}
    >
      {jobBadgeDisplayMap[label] ?? label}
    </Badge>
  );
}

export function TableView({ jobs, onJobClick }: TableViewProps) {
  return (
    <DataTable
      headers={JOB_TABLE_HEADERS}
      minWidthClassName="min-w-[1040px]"
      headerRowClassName="bg-[#FEF3E9]"
    >
      {jobs.map((job) => {
        const urgency = job.job_urgency === "instant" ? "Urgent" : "Regular";
        const ai = getInterviewLabel(job);
        const checkIn = formatTime(job.check_in_time);
        const checkOut = formatTime(job.check_out_time);
        const timings = checkIn && checkOut ? `${checkIn} – ${checkOut}` : "—";

        return (
          <tr
            key={job.id}
            className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors"
            onClick={() => onJobClick(job.id)}
          >
            <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">
              {job.job_title}
            </td>
            <td className="px-4 py-3.5 text-gray-600 text-center">
              {job.application_count}
            </td>
            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
              {formatDate(job.start_date)}
            </td>
            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
              {formatDate(job.end_date)}
            </td>
            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
              {timings}
            </td>
            <td className="px-4 py-3.5">
              <JobBadge label={urgency} />
            </td>
            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
              {formatBudget(
                job.pay_per_hour_cents
                  ? parseInt(job.pay_per_hour_cents, 10)
                  : null,
              )}
            </td>
            <td className="px-4 py-3.5">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${ai.cls}`}
              >
                {ai.label}
              </span>
            </td>
            <td className="px-4 py-3.5">
              <JobBadge label={job.status} />
            </td>
            <td className="px-4 py-3.5">
              <button
                type="button"
                className="text-gray-400 hover:text-[#F4781B] transition-colors p-1"
                title="View job"
                onClick={(event) => {
                  event.stopPropagation();
                  onJobClick(job.id);
                }}
              >
                <Eye size={18} />
              </button>
            </td>
          </tr>
        );
      })}
    </DataTable>
  );
}
