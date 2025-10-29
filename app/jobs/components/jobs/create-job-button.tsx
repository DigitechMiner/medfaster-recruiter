"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateJobButton() {
  const handleCreateJob = () => {
    // Add your job creation logic here
    console.log("Create job clicked");
  };

  return (
    <Button
      onClick={handleCreateJob}
      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm"
      size="lg"
    >
      <Plus className="w-5 h-5 mr-2" />
      Create Job
    </Button>
  );
}
