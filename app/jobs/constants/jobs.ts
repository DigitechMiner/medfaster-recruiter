import { TopJob, JobsData } from '@/Interface/job.types';

export const ALL_TOP_JOB_LISTINGS: TopJob[] = [
  { id: 1, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  { id: 2, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  { id: 3, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  { id: 4, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedcs', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  { id: 5, title: 'Job Title', experience: '3-5 yrs', position: 'Neurology Full-time', specializations: ['Neurology', 'General', 'Surgery'], postedDaysAgo: 10, applicantCount: 45 },
  { id: 6, title: 'Job Title', experience: '6-8 yrs', position: 'Surgery Part-time', specializations: ['Surgery', 'Trauma', 'General'], postedDaysAgo: 12, applicantCount: 52 },
  { id: 7, title: 'Job Title', experience: '4-6 yrs', position: 'Pediatrics Full-time', specializations: ['Pediatrics', 'General', 'Cardiology'], postedDaysAgo: 8, applicantCount: 38 },
  { id: 8, title: 'Job Title', experience: '7-9 yrs', position: 'Orthopedics Part-time', specializations: ['Orthopedics', 'Surgery', 'Trauma'], postedDaysAgo: 20, applicantCount: 67 },
  { id: 9, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  { id: 10, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  { id: 11, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  { id: 12, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
];

export const JOBS_DATA: JobsData = {
  applied: [
    { id: 1, doctorName: 'Dr. Noah Liam', experience: 5, position: 'Part-Time', score: 85, specialization: ['Cardiology', 'Orthopaedics', 'Cardiology'], currentCompany: 'Canada Health' },
    { id: 2, doctorName: 'Dr. Sarah Chen', experience: 7, position: 'Full-Time', score: 92, specialization: ['Cardiology', 'Neurology', 'General'], currentCompany: 'Medical Canada' },
    { id: 3, doctorName: 'Dr. Michael Brown', experience: 6, position: 'Part-Time', score: 88, specialization: ['Cardiology', 'Orthopaedics', 'Cardiology'], currentCompany: 'Canada Health' }
  ],
  shortlisted: [
    { id: 4, doctorName: 'Dr. Noah Liam', experience: 5, position: 'Part-Time', score: 88, specialization: ['Cardiology', 'Orthopaedcs', 'Cardiology'], currentCompany: 'Canada Health' },
    { id: 5, doctorName: 'Dr. Michael Smith', experience: 6, position: 'Part-Time', score: 90, specialization: ['Orthopedics', 'Surgery', 'General'], currentCompany: 'Medical Canada' },
    { id: 6, doctorName: 'Dr. Emily Davis', experience: 4, position: 'Full-Time', score: 87, specialization: ['Cardiology', 'Pediatrics', 'General'], currentCompany: 'Canada Health' }
  ],
  interviewing: [
    { id: 7, doctorName: 'Dr. Noah Liam', experience: 5, position: 'Part-Time', score: 87, specialization: ['Cardiology', 'Orthopaedics', 'Cardiology'], currentCompany: 'Canada Health' },
    { id: 8, doctorName: 'Dr. Emily Brown', experience: 4, position: 'Part-Time', score: 84, specialization: ['Pediatrics', 'General', 'Surgery'], currentCompany: 'Medical Canada' },
    { id: 9, doctorName: 'Dr. James Wilson', experience: 8, position: 'Full-Time', score: 91, specialization: ['Surgery', 'Orthopedics', 'General'], currentCompany: 'Canada Health' }
  ],
  hired: [
    { id: 10, doctorName: 'Dr. Noah Liam', experience: 5, position: 'Part-Time', score: 89, specialization: ['Cardiology', 'Orthopaedics', 'Cardiology'], currentCompany: 'Canada Health' },
    { id: 11, doctorName: 'Dr. James Wilson', experience: 8, position: 'Full-Time', score: 95, specialization: ['Surgery', 'Orthopedics', 'Trauma'], currentCompany: 'Medical Canada' },
    { id: 12, doctorName: 'Dr. Lisa Anderson', experience: 9, position: 'Part-Time', score: 93, specialization: ['Cardiology', 'Internal Medicine', 'General'], currentCompany: 'Canada Health' }
  ]
};

export const STATUS_SECTIONS = [
  { status: 'applied' as const, title: 'Applied', badgeColor: 'blue' as const },
  { status: 'shortlisted' as const, title: 'Shortlisted', badgeColor: 'orange' as const },
  { status: 'interviewing' as const, title: 'Interviewing', badgeColor: 'red' as const },
  { status: 'hired' as const, title: 'Hired', badgeColor: 'green' as const }
];

