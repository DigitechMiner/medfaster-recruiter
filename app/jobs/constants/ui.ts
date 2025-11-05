import { BadgeColor, StatusType } from '@/Interface/job.types';

// ============ STATUS COLORS ============
export const STATUS_COLORS: Record<string, string> = {
  applied: 'text-blue-600',
  shortlisted: 'text-orange-600',
  interviewing: 'text-red-600',
  hired: 'text-green-600'
};

export const STATUS_SECTION_COLORS: Record<BadgeColor, { border: string; bg: string; dot: string; text: string }> = {
  blue: { border: 'border-blue-200', bg: 'bg-blue-50', dot: 'bg-blue-500', text: 'text-blue-600' },
  orange: { border: 'border-orange-200', bg: 'bg-orange-50', dot: 'bg-orange-500', text: 'text-orange-600' },
  red: { border: 'border-red-200', bg: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-600' },
  green: { border: 'border-green-200', bg: 'bg-green-50', dot: 'bg-green-500', text: 'text-green-600' },
};

export const STATUS_TABLE_COLORS: Record<BadgeColor, { border: string; bg: string; dot: string; text: string; rowTint: string }> = {
  blue: { border: 'border-blue-200', bg: 'bg-blue-50', dot: 'bg-blue-500', text: 'text-blue-600', rowTint: 'bg-blue-50/40' },
  orange: { border: 'border-orange-200', bg: 'bg-orange-50', dot: 'bg-orange-500', text: 'text-orange-600', rowTint: 'bg-orange-50/40' },
  red: { border: 'border-red-200', bg: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-600', rowTint: 'bg-red-50/40' },
  green: { border: 'border-green-200', bg: 'bg-green-50', dot: 'bg-green-500', text: 'text-green-600', rowTint: 'bg-green-50/40' },
};

export const STATUS_CONFIG: Record<StatusType, { textColor: string; statusLabel: string }> = {
  applied: { textColor: 'text-blue-600', statusLabel: 'Applied' },
  shortlisted: { textColor: 'text-orange-600', statusLabel: 'Shortlisted' },
  interviewing: { textColor: 'text-red-600', statusLabel: 'Interviewing' },
  hired: { textColor: 'text-green-600', statusLabel: 'Hired' }
};

// ============ BUTTON CONFIGS ============
interface ButtonConfig {
  label: string;
  style: string;
  action?: 'schedule' | 'reject' | 'hire';
}

export const JOB_CARD_BUTTON_CONFIGS: Record<StatusType, { label: string; style: string }[]> = {
  applied: [
    { label: 'Schedule', style: 'text-gray-700 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200' },
    { label: 'Hire', style: 'bg-orange-500 text-white rounded hover:bg-orange-600' }
  ],
  shortlisted: [
    { label: 'Shortlisted', style: 'bg-[#FEF1E8] text-[#F4781B] rounded' },
    { label: 'Schedule', style: 'bg-white text-black rounded hover:bg-orange-600 border' },
    { label: 'Hire', style: 'bg-orange-500 text-white rounded hover:bg-orange-600' }
  ],
  interviewing: [
    { label: 'Interviewing', style: 'text-red-600 rounded border border-red-300 bg-red-50 hover:bg-red-100' },
    { label: 'Hire', style: 'bg-orange-500 text-white rounded hover:bg-orange-600' }
  ],
  hired: [
    { label: 'Hired', style: 'bg-green-100 text-green-700 rounded border border-green-200' }
  ]
};

export const CANDIDATE_DETAIL_BUTTON_CONFIGS: Record<StatusType, ButtonConfig[]> = {
  applied: [
    { label: 'Reject', style: 'border-2 border-red-500 text-red-500 px-6 py-2 hover:bg-red-50 rounded', action: 'reject' },
    { label: 'Schedule', style: 'border border-gray-300 text-gray-700 px-6 py-2 hover:bg-gray-50 rounded bg-white', action: 'schedule' },
    { label: 'Hire', style: 'bg-orange-500 text-white px-6 py-2 hover:bg-orange-600 rounded', action: 'hire' }
  ],
  shortlisted: [
    { label: 'Reject', style: 'border-2 border-red-500 text-red-500 px-6 py-2 hover:bg-red-50 rounded', action: 'reject' },
    { label: 'Schedule', style: 'border border-gray-300 text-gray-700 px-6 py-2 hover:bg-gray-50 rounded bg-white', action: 'schedule' },
    { label: 'Hire', style: 'bg-orange-500 text-white px-6 py-2 hover:bg-orange-600 rounded', action: 'hire' }
  ],
  interviewing: [
    { label: 'Reject', style: 'border-2 border-red-500 text-red-500 px-6 py-2 hover:bg-red-50 rounded', action: 'reject' },
    { label: 'Interviewing', style: 'border border-orange-400 text-orange-500 px-6 py-2 hover:bg-orange-50 rounded bg-white' },
    { label: 'Hire', style: 'bg-orange-500 text-white px-6 py-2 hover:bg-orange-600 rounded', action: 'hire' }
  ],
  hired: [
    { label: 'Reject', style: 'border-2 border-red-500 text-red-500 px-6 py-2 hover:bg-red-50 rounded', action: 'reject' },
    { label: 'Hired', style: 'bg-green-500 text-white px-6 py-2 hover:bg-green-600 rounded cursor-not-allowed opacity-90' }
  ]
};

export const CANDIDATE_HERO_BUTTON_CONFIGS: Record<StatusType, { label: string; style: string }[]> = {
  applied: [
    { label: 'Reject', style: 'border-2 border-red-500 text-red-500 hover:bg-red-50' },
    { label: 'Schedule', style: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
    { label: 'Shortlist', style: 'bg-orange-500 text-white hover:bg-orange-600' }
  ],
  shortlisted: [
    { label: 'Reject', style: 'border-2 border-red-500 text-red-500 hover:bg-red-50' },
    { label: 'Schedule', style: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
    { label: 'Move to Interview', style: 'bg-orange-500 text-white hover:bg-orange-600' }
  ],
  interviewing: [
    { label: 'Reject', style: 'border-2 border-red-500 text-red-500 hover:bg-red-50' },
    { label: 'Reschedule', style: 'bg-red-100 text-red-700 hover:bg-red-200' },
    { label: 'Hire', style: 'bg-green-500 text-white hover:bg-green-600' }
  ],
  hired: [
    { label: 'View Offer', style: 'bg-green-100 text-green-700 hover:bg-green-200' },
    { label: 'Generate Offer', style: 'bg-green-500 text-white hover:bg-green-600' }
  ]
};

// ============ PRIMARY BUTTON COLORS ============
export const PRIMARY_BUTTON_COLOR_CLASSES: Record<'orange' | 'red' | 'green', string> = {
  orange: 'bg-orange-500 hover:bg-orange-600',
  red: 'bg-red-500 hover:bg-red-600',
  green: 'bg-green-500 hover:bg-green-600'
};

