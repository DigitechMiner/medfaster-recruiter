import type { InterviewStatus, InterviewType } from '@/app/jobs/services/interviewApi'

// Format interview duration
export const formatDuration = (seconds: number | null): string => {
  if (!seconds) return 'N/A';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

// Get status badge color
export const getInterviewStatusColor = (status: InterviewStatus): string => {
  const colors: Record<InterviewStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    ENDED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Get status display text
export const getInterviewStatusText = (status: InterviewStatus): string => {
  const text: Record<InterviewStatus, string> = {
    PENDING: 'Not Started',
    IN_PROGRESS: 'In Progress',
    ENDED: 'Completed',
    FAILED: 'Failed',
  };
  return text[status] || status;
};

// Calculate overall score
export const calculateOverallScore = (evaluation: {
  communication: number;
  confidence: number;
  behavioral: number;
  accuracy: number;
}): number => {
  return Math.round(
    (evaluation.communication + 
     evaluation.confidence + 
     evaluation.behavioral + 
     evaluation.accuracy) / 4
  );
};

// Get score color
export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

// Format interview type
export const formatInterviewType = (type: InterviewType): string => {
  const labels: Record<InterviewType, string> = {
    JOB: 'Job Interview',
    PRACTICE: 'Practice Interview',
    MOCK: 'Mock Interview',
  };
  return labels[type] || type;
};
