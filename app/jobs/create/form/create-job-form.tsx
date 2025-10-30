"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobBasicInfo } from "../components/job-basic-info";
import { JobRequirements } from "../components/job-requirements";
import { JobInterviewSettings } from "../components/job-interview-settings";
import { JobDescription } from "../components/job-description";
import { TopActionBar } from "@/components/custom/top-action-bar";
import { useRouter } from "next/navigation";

interface Props {
  onNext?: () => void;
  onBack?: () => void;
}

export function CreateJobForm({ onNext, onBack }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    jobTitle: "Nurse",
    department: "Cardiology",
    jobType: "Part Time",
    location: "Toronto, ON",
    payRange: [2300, 2800],
    experience: "2-3 Yrs",
    qualification: ["Cardiology", "Orthopedics", "Neurology"],
    specialization: ["Cardiology", "Orthopedics", "Neurology"],
    urgency: "High",
    inPersonInterview: "Yes",
    physicalInterview: "Yes",
    description:
      "Lorem ipsum dolor sit amet consectetur. Ornare in neque varius neque. Donec quam aliquam donec morbi vel vulputate tristique quis semper. Nulla vitae sed purus enim. Dui metus tortor sit elit accumsan eu. In molestie aliquam dictum accumsan id. Sit libero nec gravida scelerisque vulputate est vitae.",
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNext) onNext();
  };

  const handlePreview = () => {
    console.log("Preview clicked");
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <TopActionBar
        title="Create Job post"
        onPreview={() => router.push("/jobs")}
        onPrimary={() => onNext && onNext()}
        primaryLabel="Save & continue"
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6 sm:mb-8">
            Create Job post
          </h2>

          <JobBasicInfo formData={formData} updateFormData={updateFormData} />

          <JobRequirements
            formData={formData}
            updateFormData={updateFormData}
          />

          <JobInterviewSettings
            formData={formData}
            updateFormData={updateFormData}
          />

          <JobDescription
            formData={formData}
            updateFormData={updateFormData}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-stretch sm:items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full sm:w-auto bg-white border-[#D9D9E0] border-2 hover:bg-gray-50 text-gray-600 px-4 sm:px-6 h-10 text-sm order-2 sm:order-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            type="submit"
            variant="ghost"
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 h-10 shadow-sm text-sm order-1 sm:order-2"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}


