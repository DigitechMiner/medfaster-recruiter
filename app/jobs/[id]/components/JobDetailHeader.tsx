"use client";

import React from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import type { JobBackendResponse } from "@/Interface/job.types";

interface JobDetailHeaderProps {
  job: JobBackendResponse;
  onBack: () => void;
  onCloseJob: () => void;
}

export const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({
  job,
  onBack,
  onCloseJob,
}) => {
  const params = useParams();
  const router = useRouter();

  const handleEdit = () => {
    const jobId = params?.id;
    if (jobId) {
      router.push(`/jobs/edit/${jobId}`);
    }
  };

  return (
    <div className="pb-4 sm:pb-6 lg:pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="w-11 h-11 rounded-lg bg-white border flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Jobs</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-orange-500 font-semibold">{job.job_title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onCloseJob}
            variant="ghost"
            size="lg"
            className="px-4 sm:px-6 lg:px-8 py-2 border border-red-500 text-red-500 underline rounded-lg text-xs sm:text-sm hover:bg-red-50"
          >
            Close This Job
          </Button>
          <Button
            onClick={handleEdit}
            variant="ghost"
            size="lg"
            className="px-4 sm:px-6 lg:px-8 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs sm:text-sm"
          >
            Edit Job
          </Button>
        </div>
      </div>
    </div>
  );
};
