import type { JobFormData } from "@/Interface/job.types";
import metadata from "@/utils/constant/metadata";

// ============ DEFAULT FORM VALUES ============
export const DEFAULT_JOB_FORM_DATA: JobFormData = {
  jobTitle: "Nurse",
  department: "Cardiology",
  jobType: "Part Time",
  location: "Toronto, ON",
  payRange: [metadata.pay_range.default_min, metadata.pay_range.default_max] as [number, number],
  experience: "2-3 Yrs",
  qualification: ["Cardiology", "Orthopedics", "Neurology"],
  specialization: ["Cardiology", "Orthopedics", "Neurology"],
  urgency: "High",
  inPersonInterview: "Yes",
  physicalInterview: "Yes",
  description:
    "Lorem ipsum dolor sit amet consectetur. Ornare in neque varius neque. Donec quam aliquam donec morbi vel vulputate tristique quis semper. Nulla vitae sed purus enim. Dui metus tortor sit elit accumsan eu. In molestie aliquam dictum accumsan id. Sit libero nec gravida scelerisque vulputate est vitae.",
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


// ============ LAYOUT MODES ============
export type LayoutMode = "kanban" | "table";

// ============ CALENDAR ============
export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
