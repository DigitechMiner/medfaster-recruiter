// hooks/useGenerateDescription.ts
import { useState } from "react";
import {
  generateJobDescriptionFromUi,
  type JobDescriptionInput,
  type GeneratedDescriptionData,
} from "@/features/jobs";

export function useGenerateDescription() {
  const [result,  setResult]  = useState<GeneratedDescriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const generateDescription = async (input: JobDescriptionInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateJobDescriptionFromUi(input);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate description");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { result, loading, error, generateDescription, reset };
}