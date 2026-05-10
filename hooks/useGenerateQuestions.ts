// hooks/useGenerateQuestions.ts
import {
  generateInterviewQuestions,
  type GenerateQuestionsPayload,
} from "@/features/jobs";
import { useState } from "react";


export function useGenerateQuestions() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const generate = async (payload: GenerateQuestionsPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateInterviewQuestions(payload);
      setQuestions(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate questions";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuestions([]);
    setError(null);
  };

  return { questions, loading, error, generate, reset };
}