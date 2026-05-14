// hooks/useGenerateDescription.ts
import { useState } from "react";
import {
  generateJobDescriptionFromUi,
  type JobDescriptionInput,
} from "@/features/jobs";

export function useGenerateDescription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDescription = async (input: JobDescriptionInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateJobDescriptionFromUi(input);
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate description",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
  };

  return { loading, error, generateDescription, reset };
}