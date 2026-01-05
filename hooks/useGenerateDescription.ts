// hooks/useGenerateDescription.ts
import { useState } from 'react';
import { generateJobDescription, JobDescriptionInput } from '@/stores/api/job-description.api';

export function useGenerateDescription() {
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDescription = async (data: JobDescriptionInput) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await generateJobDescription(data);
      
      if (response.description) {
        setDescription(response.description);
        return { success: true, description: response.description };
      } else {
        throw new Error('No description returned');
      }
    } catch (err) {
      const error = err as Error;
      const errorMessage = error.message || 'Failed to generate description';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDescription('');
    setError(null);
  };

  return {
    description,
    loading,
    error,
    generateDescription,
    reset,
  };
}
