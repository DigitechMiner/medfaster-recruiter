import type { JobFormData } from "@/Interface/recruiter.types";

// ============ DEFAULT FORM VALUES ============
export const DEFAULT_JOB_FORM_DATA: JobFormData = {
  jobTitle:         "Registered Nurse",
  department:       "Nursing",
  jobType:          "Part Time",   // ✅ changed from "Full Time" — Full Time has no pay slider
  location:         "",
  streetAddress:    "",
  postalCode:       "",
  province:         "",
  city:             "",
  payRange:         15,            // ✅ changed from tuple to single number ($15 default)
  experience:       "2-3 Yrs",
  qualification:    [],
  specialization:   [],
  urgency:          "normal",
  inPersonInterview: "Yes",
  physicalInterview: "Yes",
  aiInterview:      true,
  description:      "",
  responsibilities: [],
  required_skills:  [],
  numberOfHires:    "1",
  fromDate:         undefined,
  tillDate:         undefined,
  fromTime:         "",
  toTime:           "",
  status:           "DRAFT",
  workingConditions: [],
  whyJoin:          [],
  experienceList:   [],
  questions:        [],
};


export const DEFAULT_JOB_DESCRIPTION =
  "Lorem ipsum dolor sit amet consectetur. Ornare in neque varius neque. Donec quam aliquam donec morbi vel vulputate tristique quis semper.";

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
];


// ============ LAYOUT MODES ============
export type LayoutMode = "kanban" | "table";

// ============ CALENDAR ============
export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
