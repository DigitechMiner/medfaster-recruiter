import { getCandidateInterviews, getInterviewById, InterviewDetailsResponse, InterviewListItem } from '@/app/jobs/services/interviewApi';
import { useState, useEffect } from 'react';

// Hook to fetch single interview details
export function useInterview(interviewId: string | null) {
  const [interview, setInterview] = useState<InterviewDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!interviewId) {
      setIsLoading(false);
      return;
    }

    const fetchInterview = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getInterviewById(interviewId);
        setInterview(data);
      } catch (err: any) {
        console.error('Error fetching interview:', err);
        setError(err.response?.data?.message || 'Failed to fetch interview');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId]);

  return { interview, isLoading, error };
}

// Hook to fetch all interviews for a candidate
export function useCandidateInterviews(candidateId: string | null) {
  const [interviews, setInterviews] = useState<InterviewListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) {
      setIsLoading(false);
      return;
    }

    const fetchInterviews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCandidateInterviews(candidateId);
        setInterviews(data.interviews);
      } catch (err: any) {
        console.error('Error fetching candidate interviews:', err);
        setError(err.response?.data?.message || 'Failed to fetch interviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, [candidateId]);

  return { interviews, isLoading, error };
}
