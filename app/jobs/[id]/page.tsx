"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/modal";
import { AppLayout } from "@/components/global/app-layout";
import { useJobsStore } from "@/stores/jobs-store";
import { useJob, useJobId } from "@/hooks/useJobData";
import { UrgentJobDetail } from "./components/UrgentJobDetail";
import { NormalJobDetail } from "./components/NormalJobDetail";

export default function JobDetailPageRoute() {
  const router              = useRouter();
  const jobId               = useJobId();
  const { job, isLoading, error } = useJob(jobId);
  const updateJob           = useJobsStore((s) => s.updateJob);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isClosing, setIsClosing]           = useState(false);

  useEffect(() => {
    if (!isLoading && !job && jobId) router.replace("/jobs");
  }, [isLoading, job, jobId, router]);

  const handleCloseJobConfirm = async () => {
    if (!jobId) return;
    setIsClosing(true);
    try {
      const res = await updateJob(jobId, { status: "CLOSED" });
      if (res.success) { setShowCloseModal(false); router.push("/jobs"); }
      else alert(res.message || "Failed to close job");
    } catch (err) {
      alert((err as Error).message || "Error closing job");
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout padding="all">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !job) {
    return (
      <AppLayout padding="all">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-red-600">{error || "Job not found"}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout padding="all">
      {/* Differentiate here — urgent vs normal */}
      {job.job_urgency === "instant" ? (
        <UrgentJobDetail
          job={job}
          jobId={jobId!}
          onCloseJob={() => setShowCloseModal(true)}
        />
      ) : (
        <NormalJobDetail
          job={job}
          jobId={jobId!}
          onCloseJob={() => setShowCloseModal(true)}
        />
      )}

      <Modal
        visible={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        variant="confirmation"
        title="Are you sure want to close this job?"
        message=""
        primaryButtonText={isClosing ? "Closing..." : "Yes"}
        secondaryButtonText="No"
        onConfirm={handleCloseJobConfirm}
        onCancel={() => setShowCloseModal(false)}
      />
    </AppLayout>
  );
}