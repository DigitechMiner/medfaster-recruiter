// ✅ Remove: import { JobsData } from '@/Interface/recruiter.types';
// Import the local type instead

import { JobsDataMock } from "../constants/jobs";

export const candidatesData: JobsDataMock = {
  applied: [
    { id: 1, doctorName: 'Dr. Noah Liam',      experience: 5, position: 'Part-Time', score: 85, specialization: ['Cardiology', 'Orthopaedics'], currentCompany: 'Canada Health'  },
    { id: 2, doctorName: 'Dr. Sarah Chen',     experience: 7, position: 'Full-Time', score: 92, specialization: ['Cardiology', 'Neurology'],    currentCompany: 'Medical Canada' },
    { id: 3, doctorName: 'Dr. Michael Brown',  experience: 6, position: 'Part-Time', score: 88, specialization: ['Cardiology', 'Orthopaedics'], currentCompany: 'Canada Health'  },
  ],
  interviewing: [
    { id: 7, doctorName: 'Dr. Noah Liam',      experience: 5, position: 'Part-Time', score: 87, specialization: ['Cardiology', 'Orthopaedics'], currentCompany: 'Canada Health'  },
    { id: 8, doctorName: 'Dr. Emily Brown',    experience: 4, position: 'Part-Time', score: 84, specialization: ['Pediatrics', 'General'],      currentCompany: 'Medical Canada' },
    { id: 9, doctorName: 'Dr. James Wilson',   experience: 8, position: 'Full-Time', score: 91, specialization: ['Surgery', 'Orthopedics'],     currentCompany: 'Canada Health'  },
  ],
  hired: [
    { id: 10, doctorName: 'Dr. Noah Liam',     experience: 5, position: 'Part-Time', score: 89, specialization: ['Cardiology', 'Orthopaedics'],       currentCompany: 'Canada Health'  },
    { id: 11, doctorName: 'Dr. James Wilson',  experience: 8, position: 'Full-Time', score: 95, specialization: ['Surgery', 'Orthopedics'],           currentCompany: 'Medical Canada' },
    { id: 12, doctorName: 'Dr. Lisa Anderson', experience: 9, position: 'Part-Time', score: 93, specialization: ['Cardiology', 'Internal Medicine'],  currentCompany: 'Canada Health'  },
  ],
};