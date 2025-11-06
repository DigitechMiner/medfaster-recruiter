// ============ FORM DROPDOWNS ============
export const JOB_TITLES = [
  "Nurse",
  "Orthopaedics",
  "Dermatology",
  "Neurology",
  "Cardiology",
  "Pediatrics",
];

export const DEPARTMENTS = [
  "Cardiology",
  "Neurology",
  "Orthopaedics",
  "Dermatology",
  "Pediatrics",
  "Emergency",
];

export const EXPERIENCES = [
  "0-1 Yrs",
  "1-2 Yrs",
  "2-3 Yrs",
  "3-5 Yrs",
  "5-7 Yrs",
  "7-10 Yrs",
  "10+ Yrs",
];

export const JOB_TYPES = [
  "Part Time",
  "Full Time",
  "Freelancer",
];

// ============ DEFAULT FORM VALUES ============
export const DEFAULT_JOB_FORM_DATA = {
  jobTitle: "Nurse",
  department: "Cardiology",
  jobType: "Part Time",
  location: "Toronto, ON",
  payRange: [2300, 2800] as [number, number],
  experience: "2-3 Yrs",
  qualification: ["Cardiology", "Orthopedics", "Neurology"],
  specialization: ["Cardiology", "Orthopedics", "Neurology"],
  urgency: "High",
  inPersonInterview: "Yes",
  physicalInterview: "Yes",
  description:
    "Lorem ipsum dolor sit amet consectetur. Ornare in neque varius neque. Donec quam aliquam donec morbi vel vulputate tristique quis semper. Nulla vitae sed purus enim. Dui metus tortor sit elit accumsan eu. In molestie aliquam dictum accumsan id. Sit libero nec gravida scelerisque vulputate est vitae.",
};

export const DEFAULT_JOB_DESCRIPTION = 'Lorem ipsum dolor sit amet consectetur. Ornare in neque varius neque. Donec quam aliquam donec morbi vel vulputate tristique quis semper.';

// ============ DEFAULT TOPICS/QUESTIONS ============
export interface Question {
  id: string;
  text: string;
}

export interface Topic {
  id: string;
  title: string;
  questions: Question[];
}

export const DEFAULT_TOPICS: Topic[] = [
  {
    id: "1",
    title: "Questions Topic 1",
    questions: [
      { id: "1-1", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
      { id: "1-2", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
      { id: "1-3", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
      { id: "1-4", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
    ],
  },
  {
    id: "2",
    title: "Questions Topic 2",
    questions: [
      { id: "2-1", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
      { id: "2-2", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
      { id: "2-3", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
    ],
  },
  {
    id: "3",
    title: "Questions Topic 3",
    questions: [
      { id: "3-1", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
      { id: "3-2", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
      { id: "3-3", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
      { id: "3-4", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
    ],
  },
  {
    id: "4",
    title: "Questions Topic 4",
    questions: [
      { id: "4-1", text: "Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?" },
      { id: "4-2", text: "Lorem ipsum dolor sit amet consectetuer Non commodo" },
    ],
  },
];

// ============ FORM VALIDATION ============
export const PAY_RANGE_MIN = 1000;
export const PAY_RANGE_MAX = 10000;
export const PAY_RANGE_STEP = 100;

// ============ LAYOUT MODES ============
export type LayoutMode = 'kanban' | 'table';

// ============ CALENDAR ============
export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

