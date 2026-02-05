// app/jobs/components/empty.tsx
"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Paragraph } from "@/components/custom/paragraph";
import { Heading } from "@/components/custom/heading";

export function EmptyJobState() {
  const router = useRouter();

  const handleCreateJob = () => {
    router.push("/jobs/create");
  };

  const handleInstantReplacement = () => {
    router.push("/jobs/instant-replacement");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20">
      {/* Empty State SVG Illustration */}
      <div className="relative w-40 h-40">
        <Image
          src="/svg/empty-job.svg"
          alt="Empty Job Illustration"
          fill
          className="object-contain"
          priority
        />
      </div>

      <Heading size="xs" className="text-gray-900 mb-2">
        Empty Job
      </Heading>
      <Paragraph size="sm" className="text-[#A4A7AE] mb-6">
        Lorem ipsum dolor sit amet consectetur.
      </Paragraph>

      {/* Two Buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleInstantReplacement}
          variant="ghost"
          size="lg"
          className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
        >
          Instant Replacement
        </Button>
        <Button
          onClick={handleCreateJob}
          size="lg"
          className="bg-[#F4781B] hover:bg-orange-600"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Job
        </Button>
      </div>
    </div>
  );
}
