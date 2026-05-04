// hooks/useApplicationStatus.ts
import { useState } from "react";
import { updateApplicationStatus } from "@/stores/api/recruiter-job-api";

export function useApplicationStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (
    applicationId: string,
    status: 'SHORTLISTED' | 'INTERVIEWING' | 'INTERVIEWED' | 'HIRE' | 'REJECTED'
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      return await updateApplicationStatus(applicationId, status);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e.message ?? 'Failed to update status';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateStatus, isLoading, error };
}