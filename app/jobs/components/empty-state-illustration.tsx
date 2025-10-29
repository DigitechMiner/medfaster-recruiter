import Image from "next/image";

export function EmptyStateIllustration() {
  return (
    <div className="relative w-40 h-40">
      <Image
        src="/svg/empty-job.svg"
        alt="Empty Job Illustration"
        fill
        className="object-contain"
      />
    </div>
  );
}
