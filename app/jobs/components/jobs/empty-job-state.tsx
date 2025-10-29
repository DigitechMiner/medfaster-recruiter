import Image from "next/image";
import { CreateJobButton } from "./create-job-button";

export function EmptyJobState() {
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
      
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Empty Job
      </h2>
      <p className="text-gray-500 mb-6">
        Lorem ipsum dolor sit amet consectetur.
      </p>
      <CreateJobButton />
    </div>
  );
}
