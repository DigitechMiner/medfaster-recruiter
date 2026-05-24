import type { JobFormData } from "@/types";

export const DEFAULT_JOB_FORM_DATA: JobFormData = {
  job_title: "",
  department: "",
  job_type: "part_time",
  street: "",
  postal_code: "",
  province: "",
  city: "",
  country: "Canada",
  years_of_experience: "0",
  qualifications: [],
  specializations: [],
  job_urgency: "NORMAL",
  ai_interview: false,
  description: "",
  responsibilities: [],
  required_skills: [],
  no_of_hires_required: "1",
  start_date: undefined,
  end_date: undefined,
  status: "OPEN",
  working_conditions: [],
  why_join: [],
  experience: [],
  questions: [],
  job_duration_per_day: "24",
  shift_duration_type: "8_hrs",
  staffing_type: "rotational",
  selected_shift_types: ["morning", "evening", "night"],
  job_period_option: "custom_end_date",
  cycle_start_day: "SATURDAY",
  number_of_teams: "2",
  shift_schedule_details: {},
  schedule_template: [],
  morning_shift_start: "",
  morning_shift_end: "",
  evening_shift_start: "",
  evening_shift_end: "",
  night_shift_start: "",
  night_shift_end: "",
  backend_pay_rate: undefined,
};

export const MAX_AI_QUESTIONS = 10;
export const MIN_AI_QUESTIONS = 5;

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
