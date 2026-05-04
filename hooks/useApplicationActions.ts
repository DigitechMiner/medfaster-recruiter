import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { addInHouseCandidate, getCandidateDocumentUrl, removeInHouseCandidate, updateApplicationStatus } from "@/stores/api/recruiter-job-api";
import { cancelRecruiterInterviewRequest, createRecruiterInterviewRequest } from "@/app/jobs/services/interviewApi";


// ── Application Status ────────────────────────────────────────────────────────
export function useApplicationStatus() {
  const qc = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const updateStatus = useCallback(async (
    applicationId: string,
    status: 'SHORTLISTED' | 'INTERVIEWING' | 'INTERVIEWED' | 'HIRE' | 'REJECTED'
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await updateApplicationStatus(applicationId, status);
      // Invalidate so candidate tables refetch automatically
      qc.invalidateQueries({ queryKey: ["job-application-cards"] });
      qc.invalidateQueries({ queryKey: ["candidate-cards"] });
      return res;
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Failed to update status";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [qc]);

  return { updateStatus, isLoading, error };
}

// ── Interview Requests ────────────────────────────────────────────────────────
export function useCreateInterviewRequest() {
  const qc = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const createRequest = useCallback(async (payload: {
    candidate_id:       string;
    job_application_id: string;  // ✅ correct field — not job_id
    valid_until:        string;  // ✅ ISO string — how long request is open
    message?:           string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await createRecruiterInterviewRequest(payload);
      qc.invalidateQueries({ queryKey: ["interview-requests"] });
      return res;
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Failed to create interview request";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [qc]);

  return { createRequest, isLoading, error };
}

export function useCancelInterviewRequest() {
  const qc = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const cancel = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await cancelRecruiterInterviewRequest(id);
      qc.invalidateQueries({ queryKey: ["interview-requests"] });
      return res;
    } finally {
      setIsLoading(false);
    }
  }, [qc]);

  return { cancel, isLoading };
}

// ── In-House ──────────────────────────────────────────────────────────────────
export function useInHouseActions() {
  const qc = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const add = useCallback(async (candidateId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await addInHouseCandidate(candidateId);
      qc.invalidateQueries({ queryKey: ["inhouse-accepted"] });
      return res;
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to add in-house");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [qc]);

  const remove = useCallback(async (candidateId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await removeInHouseCandidate(candidateId);
      qc.invalidateQueries({ queryKey: ["inhouse-accepted"] });
      qc.invalidateQueries({ queryKey: ["inhouse-invited"] });
      return res;
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to remove in-house");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [qc]);

  return { add, remove, isLoading, error };
}

// ── Candidate Document Signed URL ─────────────────────────────────────────────
export function useCandidateDocumentUrl() {
  const [url,       setUrl]       = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const fetchUrl = useCallback(async (candidateId: string, documentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCandidateDocumentUrl(candidateId, documentId);
      setUrl(res.url);
      return res.url;
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to fetch document URL");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchUrl, url, isLoading, error };
}