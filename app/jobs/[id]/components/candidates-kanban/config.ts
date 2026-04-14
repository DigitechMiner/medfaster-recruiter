"use client";

export interface Candidate {
  id: string;
  name: string;
  role: string;
  exp: string;
  distance: string;
  rating: number;
  score: number;
  online: boolean;
  avatar: string;
}

export type ColKey = 'applied' | 'shortlisted' | 'ai_interviewing' | 'interviewed' | 'hired';

export interface ColConfig {
  key:       ColKey;
  label:     string;
  count:     number;
  dotColor:  string;
  border:    string;
  bg:        string;
  textColor: string;
  aiOnly?:   boolean;
}

export const DUMMY_CANDIDATES: Candidate[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  name: 'Michael Liam',
  role: 'Registered Nurse',
  exp: '5+ yrs',
  distance: '25km',
  rating: 4.8,
  score: 40,
  online: true,
  avatar: '/icon/card-doctor.svg',
}));

export const COLUMNS: ColConfig[] = [
  { key: 'applied',         label: 'Applied',               count: 40, dotColor: 'bg-blue-500',   border: 'border-blue-300',   bg: 'bg-blue-50/60',   textColor: 'text-blue-600' },
  { key: 'shortlisted',     label: 'Shortlisted',           count: 20, dotColor: 'bg-orange-400', border: 'border-orange-300', bg: 'bg-orange-50/60', textColor: 'text-[#F4781B]' },
  { key: 'ai_interviewing', label: 'AI-Interviewing',       count: 5,  dotColor: 'bg-red-400',    border: 'border-red-300',    bg: 'bg-red-50/60',    textColor: 'text-red-500', aiOnly: true },
  { key: 'interviewed',     label: 'Interviewed',           count: 6,  dotColor: 'bg-red-500',    border: 'border-red-400',    bg: 'bg-red-50/40',    textColor: 'text-red-500' },
  { key: 'hired',           label: 'Hired',                 count: 2,  dotColor: 'bg-green-500',  border: 'border-green-300',  bg: 'bg-green-50/60',  textColor: 'text-green-600' },
];
