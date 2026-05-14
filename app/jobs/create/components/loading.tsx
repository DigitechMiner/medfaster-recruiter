import { AppLayout } from "@/components/global/app-layout";

export function CreateJobLoadingFallback() {
  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading...</p>
      </div>
    </AppLayout>
  );
}
