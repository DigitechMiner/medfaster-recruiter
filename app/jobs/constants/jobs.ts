import { TopJob, JobsData, Job } from '@/Interface/job.types';

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

export const SHORTLISTED_DUMMY: Job[] = [
  { id: 101, candidateId: "cand-101", doctorName: "Dr. Sarah Mitchell",   experience: 5, position: "Senior Cardiologist",        score: 92, specialization: ["Cardiology", "Internal Medicine"], currentCompany: "City General Hospital" },
  { id: 102, candidateId: "cand-102", doctorName: "Dr. James Chen",       experience: 7, position: "Orthopedic Surgeon",          score: 88, specialization: ["Orthopedics", "Sports Medicine"],  currentCompany: "Regional Medical Center" },
  { id: 103, candidateId: "cand-103", doctorName: "Dr. Emily Rodriguez",  experience: 4, position: "Pediatrician",                score: 85, specialization: ["Pediatrics"],                      currentCompany: "Children's Healthcare" },
];

export const INTERVIEWING_DUMMY: Job[] = [
  { id: 201, candidateId: "cand-201", doctorName: "Dr. Michael Thompson", experience: 6, position: "Emergency Medicine Physician", score: 90, specialization: ["Emergency Medicine", "Trauma Care"], currentCompany: "Metro Hospital" },
  { id: 202, candidateId: "cand-202", doctorName: "Dr. Priya Sharma",     experience: 8, position: "Neurologist",                 score: 94, specialization: ["Neurology", "Neurosurgery"],         currentCompany: "Brain & Spine Institute" },
];

export const HIRED_DUMMY: Job[] = [
  { id: 301, candidateId: "cand-301", doctorName: "Dr. Robert Williams",  experience: 10, position: "Chief of Surgery",           score: 96, specialization: ["General Surgery", "Laparoscopic Surgery"], currentCompany: "Premier Healthcare System" },
  { id: 302, candidateId: "cand-302", doctorName: "Dr. Maria Garcia",     experience: 6,  position: "Dermatologist",              score: 89, specialization: ["Dermatology"],                           currentCompany: "Skin & Beauty Clinic" },
];