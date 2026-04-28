"use client";

import type {
  QualificationVM,
  DocumentVM,
  WorkExperienceVM,
  WorkHistoryEntryVM,
  ReviewVM,
} from "@/Interface/view-models";

// ── Education (QualificationVM) ───────────────────────────────────
export const STATIC_EDUCATION_FULL: QualificationVM[] = [
  { id: "ed1", degree: "Master Degree", field: "MD",    institution: "Canadian Red Cross University", start_year: "Jan 2023", end_year: "Dec 2025" },
  { id: "ed2", degree: "Bachelor",      field: "B.Sc.", institution: "Canadian Special School",       start_year: "Jan 2020", end_year: "Dec 2023" },
  { id: "ed3", degree: "Diploma",       field: "B.Sc.", institution: "Canadian Special School",       start_year: "Feb 2017", end_year: "Dec 2020" },
];

// ── Licensing + Registration — no VM yet, plain objects ───────────
export const STATIC_LICENSING = [
  { id: "lic1", exam: "NCLEX-PN (Exam)", score: 235, cleared: "2023" },
];

export const STATIC_REGISTRATION = [
  { id: "reg1", type: "Provisional Nursing Body Registered", body: "College of Nurses of Ontario", number: "ONT-12345", expiry: "Dec 2026" },
];

// ── Documents (DocumentVM) ────────────────────────────────────────
export const STATIC_PERSONAL_DOCS: DocumentVM[] = [
  { document_id: "pd1", document_type: "passport",              category: "personal", title: "Passport",             file_url: null, signed_url: null },
  { document_id: "pd2", document_type: "pr_card",               category: "personal", title: "PR Card",              file_url: null, signed_url: null },
  { document_id: "pd3", document_type: "work_permit",           category: "personal", title: "Valid Work Permit",     file_url: null, signed_url: null },
  { document_id: "pd4", document_type: "criminal_record_check", category: "personal", title: "Criminal Record Check", file_url: null, signed_url: null },
];

export const STATIC_LICENSE_DOCS: DocumentVM[] = [
  { document_id: "ld1", document_type: "lpn_license",       category: "license_certificate", title: "LPN License",                       file_url: null, signed_url: null },
  { document_id: "ld2", document_type: "first_aid",         category: "license_certificate", title: "First Aid Certificate",              file_url: null, signed_url: null },
  { document_id: "ld3", document_type: "liability",         category: "license_certificate", title: "Professional Liability Certificate", file_url: null, signed_url: null },
  { document_id: "ld4", document_type: "flu_vaccination",   category: "license_certificate", title: "Flu Vaccination Certificate",        file_url: null, signed_url: null },
  { document_id: "ld5", document_type: "covid_vaccination", category: "license_certificate", title: "Covid Vaccination Certificate",      file_url: null, signed_url: null },
  { document_id: "ld6", document_type: "tb_screening",      category: "license_certificate", title: "TB Screening Certificate",           file_url: null, signed_url: null },
];

// ── Work Experience (WorkExperienceVM) ────────────────────────────
export const STATIC_WORK_EXPERIENCE: WorkExperienceVM[] = [
  {
    id: "we1", organization: "Medfasterrr", role: "Assistant of Audiology",
    job_type: "Full Time", start_date: "Jan 2025", end_date: null,
    is_current: true, org_photo: null,
    description: "Lorem ipsum dolor sit amet consectetur. Augue dolor enim imperdiet placerat vulputate proin leo. Ipsum est nisl pulvinar libero. Quam elementum neque amet odio. In est sit varius cursus vitae velit nec. Pellentesque egestas eu sit amet accumsan lectus. Tincidunt faucibus aenean orci euismod dui. Massa eu mattis turpis pellentesque neque volutpat nunc.",
  },
  {
    id: "we2", organization: "Medfasterrr", role: "Assistant of Audiology",
    job_type: "Full Time", start_date: "Jan 2024", end_date: "Jan 2025",
    is_current: false, org_photo: null,
    description: "Lorem ipsum dolor sit amet consectetur. Augue dolor enim imperdiet placerat vulputate proin leo. Ipsum est nisl pulvinar libero. Quam elementum neque amet odio. In est sit varius cursus vitae velit nec.",
  },
  {
    id: "we3", organization: "Medfasterrr", role: "Assistant of Audiology",
    job_type: "Full Time", start_date: "Jan 2023", end_date: "Jan 2024",
    is_current: false, org_photo: null,
    description: "Lorem ipsum dolor sit amet consectetur. Augue dolor enim imperdiet placerat vulputate proin leo. Ipsum est nisl pulvinar libero.",
  },
];

// ── Work History (WorkHistoryEntryVM) ─────────────────────────────
export const STATIC_WORK_HISTORY: WorkHistoryEntryVM[] = [
  { application_id: "wh1", job_title: "Candidate Behavior", organization: "KRV-JB-8821", job_type: "Regular", completed_date: "Jan 29, 2024", status: "Completed" },
  { application_id: "wh2", job_title: "Payment Issue",      organization: "KRV-JB-8765", job_type: "Urgent",  completed_date: "Jan 15, 2024", status: "Completed" },
];

// ── Reviews (ReviewVM) ────────────────────────────────────────────
export const STATIC_REVIEWS: ReviewVM[] = [
  { id: "rv1", rating: 5, comment: "Excellent service, very punctual and safe driving.", job_title: "Registered Nurse", organization: "Canadian Medical", recruiter_title: "KRV_RCT-8901", created_at: "February 2, 2024" },
  { id: "rv2", rating: 4, comment: "Good ride, but vehicle could be cleaner.",           job_title: "Care Aide",         organization: "Medical Canada",   recruiter_title: "KRV_RCT-8902", created_at: "February 1, 2024" },
  { id: "rv3", rating: 5, comment: "Excellent service, very punctual and safe driving.", job_title: "Registered Nurse", organization: "Canadian Medical", recruiter_title: "KRV_RCT-8901", created_at: "February 2, 2024" },
  { id: "rv4", rating: 4, comment: "Good ride, but vehicle could be cleaner.",           job_title: "Care Aide",         organization: "Medical Canada",   recruiter_title: "KRV_RCT-8902", created_at: "February 1, 2024" },
];

// ── Grievances — no VM yet (TODO: add GrievanceVM when backend ready) ──
export const STATIC_GRIEVANCES = [
  {
    id: "gr1", ticketId: "GRV-456", category: "Candidate Behavior", relatedJob: "KRV-JB-8821",
    priority: "High",   priorityColor: "bg-red-100 text-red-600",
    status: "Resolved", statusColor:   "bg-green-100 text-green-700",
    sla: "Met",         slaColor:      "bg-green-100 text-green-700",
    date: "Jan 29, 2024",
    resolution: "Candidate Counselled And Warned. Fare Refunded To Passenger.",
  },
  {
    id: "gr2", ticketId: "GRV-389", category: "Payment Issue", relatedJob: "KRV-JB-8765",
    priority: "Medium", priorityColor: "bg-yellow-100 text-yellow-700",
    status: "Closed",   statusColor:   "bg-green-100 text-green-700",
    sla: "Met",         slaColor:      "bg-green-100 text-green-700",
    date: "Jan 15, 2024",
    resolution: "Payment Gateway Issue Resolved. Amount Refunded.",
  },
];

// ── Performance — static until AI rounds are in API ───────────────
export const STATIC_PERFORMANCE = {
  conversational: {
    score: 82, strength: "Strong verbal communication and rapport building.",
    metrics: [{ label: "Clarity", value: 85 }, { label: "Empathy", value: 80 }, { label: "Engagement", value: 78 }],
  },
  behavioral: {
    score: 76, strength: "Consistent professional conduct under pressure.",
    metrics: [{ label: "Punctuality", value: 90 }, { label: "Team Work", value: 74 }, { label: "Reliability", value: 65 }],
  },
  communication: {
    score: 88, strength: "Excellent written and verbal documentation skills.",
    metrics: [{ label: "Listening", value: 92 }, { label: "Articulation", value: 85 }, { label: "Tone", value: 87 }],
  },
  accuracy: {
    score: 71, strength: "Good clinical knowledge with room to improve edge cases.",
    metrics: [{ label: "Medical Facts", value: 75 }, { label: "Scenarios", value: 68 }, { label: "Protocols", value: 70 }],
  },
};

// ── Tabs ──────────────────────────────────────────────────────────
export const TABS = [
  "General score",
  "Qualifications",
  "Documentations",
  "Job Experience",
  "Work History",
  "Reviews & Ratings",
  "Complaints & Grievances",
] as const;

export type Tab = typeof TABS[number];