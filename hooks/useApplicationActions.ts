import { useState, useCallback } from "react";
import { getCandidateDocumentUrl } from "@/stores/api/recruiter-job-api";

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