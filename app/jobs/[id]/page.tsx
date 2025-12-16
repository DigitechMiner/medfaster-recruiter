"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/modal";
import { JobDetailHeader } from "./components/JobDetailHeader";
import { JobDetailSections } from "./components/JobDetailSections";
import { AppLayout } from "@/components/global/app-layout";

import { useJobsStore } from "@/stores/jobs-store";
import { useJob, useJobId } from "@/hooks/useJobData";

export default function JobDetailPageRoute() {
  const router = useRouter();
  const jobId = useJobId(); // string | null (UUID)
  const { job, isLoading, error } = useJob(jobId);
  const updateJob = useJobsStore((state) => state.updateJob);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Redirect if job not found (after loading)
  useEffect(() => {
    if (!isLoading && !job && jobId) {
      router.replace("/jobs");
    }
  }, [isLoading, job, jobId, router]);

  const handleBack = () => {
    router.push("/jobs");
  };

  const handleCloseJobClick = () => {
    setShowCloseModal(true);
  };

  const handleCloseJobConfirm = async () => {
    if (!jobId) return;

    setIsClosing(true);
    try {
      const res = await updateJob(jobId, { status: "closed" });
      if (res.success) {
        setShowCloseModal(false);
        router.push("/jobs");
      } else {
        alert(res.message || "Failed to close job");
      }
    } catch (err) {
  const error = err as Error;
  alert(error.message || "Error closing job");
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !job) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-red-600">{error || "Job not found"}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <JobDetailHeader
        job={job}
        onBack={handleBack}
        onCloseJob={handleCloseJobClick}
      />
      <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-lg border border-gray-200">
        <JobDetailSections job={job} />
      </div>
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
