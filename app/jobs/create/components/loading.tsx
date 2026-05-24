import { AppLayout } from "@/components/global/app-layout";

function ListSectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="mb-8 space-y-3">
      <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-11 w-full animate-pulse rounded-md bg-gray-100"
        />
      ))}
    </div>
  );
}

export function DescriptionStepSkeleton({
  sectionCount = 5,
}: {
  sectionCount?: number;
}) {
  return (
    <div aria-busy="true" aria-label="Loading job description">
      <div className="mb-8 space-y-2 sm:space-y-3">
        <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
        <div className="min-h-[120px] w-full animate-pulse rounded-md bg-gray-100 sm:min-h-[140px]" />
      </div>
      {Array.from({ length: sectionCount }, (_, index) => (
        <ListSectionSkeleton key={index} rows={index === 0 ? 3 : 2} />
      ))}
    </div>
  );
}

export function CreateJobLoadingFallback() {
  return (
    <AppLayout>
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    </AppLayout>
  );
}
