// src/app/(recruiter)/jobs/constants/jobs.ts

// ✅ REMOVE this broken import entirely:
// import { TopJob } from '@/Interface/recruiter.types';

// ✅ ADD this local type at the top:
export interface TopJobMock {
  id:              number;        // ← numbers are fine here — this is display-only
  title:           string;
  experience:      string;
  position:        string;
  specializations: string[];
  postedDaysAgo:   number;
  applicantCount:  number;
}

// ✅ Change the array type to your local type:
export const jobsData: TopJobMock[] = [
  { id: 1,  title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time',  specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  { id: 2,  title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time',  specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  { id: 3,  title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time',  specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  { id: 4,  title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time',  specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  { id: 5,  title: 'Job Title', experience: '3-5 yrs', position: 'Neurology Full-time',   specializations: ['Neurology', 'General', 'Surgery'],           postedDaysAgo: 10, applicantCount: 45 },
  { id: 6,  title: 'Job Title', experience: '6-8 yrs', position: 'Surgery Part-time',     specializations: ['Surgery', 'Trauma', 'General'],             postedDaysAgo: 12, applicantCount: 52 },
  { id: 7,  title: 'Job Title', experience: '4-6 yrs', position: 'Pediatrics Full-time',  specializations: ['Pediatrics', 'General', 'Cardiology'],       postedDaysAgo: 8,  applicantCount: 38 },
  { id: 8,  title: 'Job Title', experience: '7-9 yrs', position: 'Orthopedics Part-time', specializations: ['Orthopedics', 'Surgery', 'Trauma'],          postedDaysAgo: 20, applicantCount: 67 },
  { id: 9,  title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time',  specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  { id: 10, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time',  specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  { id: 11, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time',  specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  { id: 12, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time',  specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
];