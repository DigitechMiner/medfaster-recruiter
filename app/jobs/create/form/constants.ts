import type { InstantJobFormData, JobFormData } from "@/types";

export const DEFAULT_JOB_FORM_DATA: JobFormData = {
  jobTitle: "",
  department: "",
  jobType: "Part Time",
  streetAddress: "",
  postalCode: "",
  province: "",
  city: "",
  country: "Canada",
  payRange: 0,
  experience: "4-5",
  qualification: [],
  specialization: [],
  urgency: "normal",
  inPersonInterview: "Yes",
  aiInterview: true,
  description: "",
  responsibilities: [],
  required_skills: [],
  numberOfHires: "",
  fromDate: undefined,
  tillDate: undefined,
  fromTime: "07:30",
  toTime: "11:30",
  status: "OPEN",
  workingConditions: [],
  whyJoin: [],
  experienceList: [],
  questions: [],
};

export const DEFAULT_INSTANT_FORM: InstantJobFormData = {
  jobTitle: "",
  department: "",
  jobType: "casual",
  experience: "",
  specialization: [],
  urgency: "instant",
  description: "",
  responsibilities: [],
  required_skills: [],
  workingConditions: [],
  whyJoin: [],
  status: "DRAFT",
  numberOfHires: "",
  fromDate: undefined,
  tillDate: undefined,
  fromTime: "08:00",
  toTime: "16:00",
  neighborhoodName: "",
  neighborhoodType: "",
  directNumber: "",
  streetAddress: "",
  postalCode: "",
  province: "",
  city: "",
  country: "Canada",
};

export const DESCRIPTION_STEP_FIELDS = new Set([
  "description",
  "responsibilities",
  "required_skills",
  "experience",
  "working_conditions",
  "why_join",
  "questions",
]);

export const MAX_AI_QUESTIONS = 10;

export const SUCCESS_MESSAGES = {
  JOB_CREATED: {
    title: "Job created successfully",
    message: "Your job post has been created.",
    buttonText: "Done",
  },
};

export const PAGE_TITLES = {
  GENERATE_WITH_AI: "Create Job post",
};

export const BUTTON_LABELS = {
  CREATE: "Create",
  SAVE_AND_CONTINUE: "Save & continue",
};
