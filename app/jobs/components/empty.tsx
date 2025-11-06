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

      <Heading size="xs" className=" text-gray-900 mb-2">Empty Job</Heading>
      <Paragraph size="sm" className="text-[#A4A7AE] mb-3" >Lorem ipsum dolor sit amet consectetur.</Paragraph>
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


