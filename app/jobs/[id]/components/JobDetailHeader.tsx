"use client";

import React from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JobBackendResponse } from "@/Interface/recruiter.types";

interface JobDetailHeaderProps {
  job: JobBackendResponse;
  onBack: () => void;
  onCloseJob: () => void;
}

export const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({
  job,
  onBack,
}) => {

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
            <span className="text-[#F4781B] font-semibold">{job.job_title}</span>
          </div>
        </div>
     
      </div>
    </div>
  );
};
