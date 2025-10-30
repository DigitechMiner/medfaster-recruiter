"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function EmptyJobState() {
  const router = useRouter();
  const handleCreateJob = () => {
    router.push("/jobs/create");
  };

  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Empty State SVG Illustration */}
      <div className="relative w-40 h-40 mb-6">
        <Image
          src="/svg/empty-job.svg"
          alt="Empty Job Illustration"
          fill
          className="object-contain"
          priority
        />
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Empty Job</h2>
      <p className="text-gray-500 mb-6">Lorem ipsum dolor sit amet consectetur.</p>
      <Button
        onClick={handleCreateJob} 
        size="lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Job
      </Button>
    </div>
  );
}


