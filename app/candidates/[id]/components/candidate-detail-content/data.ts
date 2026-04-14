"use client";

export const STATIC_EDUCATION_FULL = [
  { id: "ed1", school: "Canadian Red Cross University", degree: "Master Degree", field: "MD",    period: "Jan 2025 - Dec 2023" },
  { id: "ed2", school: "Canadian Special School",      degree: "Bachelor",       field: "B.Sc.", period: "Jan 2023 - Dec 2020" },
  { id: "ed3", school: "Canadian Special School",      degree: "Diploma",        field: "B.Sc.", period: "Dec 2020 - Feb 2017" },
];

export const STATIC_LICENSING = [
  { id: "lic1", exam: "NCLEX-PN (Exam)", score: 235, cleared: "2023" },
];

export const STATIC_REGISTRATION = [
  { id: "reg1", type: "Provisional Nursing Body Registered", body: "College of Nurses of Ontario", number: "ONT-12345", expiry: "Dec 2026" },
];

export const STATIC_PERSONAL_DOCS = [
  { id: "pd1", title: "Passport" },
  { id: "pd2", title: "PR Card" },
  { id: "pd3", title: "Valid Work Permit" },
  { id: "pd4", title: "Criminal Record Check" },
];

export const STATIC_LICENSE_DOCS = [
  { id: "ld1", title: "LPN License" },
  { id: "ld2", title: "First Aid Certificate" },
  { id: "ld3", title: "Professional Liability Certificate" },
  { id: "ld4", title: "Flu Vaccination Certificate" },
  { id: "ld5", title: "Covid Vaccination Certificate" },
  { id: "ld6", title: "TB Screeing Certificate" },
];

export const STATIC_WORK_EXPERIENCE = [
  {
    id: "we1",
    company: "Medfasterrr",
    logo: "/svg/hospital-iconn.svg",
    title: "Assistant of audiology",
    type: "Full Time",
    start: "Jan 2025",
    end: "Present",
    desc: "Lorem ipsum dolor sit amet consectetur. Augue dolor enim imperdiet placerat vulputate proin leo. Ipsum est nisl pulvinar libero. Quam elementum neque amet odio. In est sit varius cursus vitae velit nec. Pellentesque egestas eu sit amet accumsan lectus. Tincidunt faucibus aenean orci euismod dui. Massa eu mattis turpis pellentesque neque volutpat nunc. Etiam consequat egestas nibh quam et et varius. Dolor eu massa ipsum mollis. Integer urna est amet vestibulum et nunc nibh. Et neque nisl aenean amet. Tellus dictum diam eget amet.",
  },
  {
    id: "we2",
    company: "Medfasterrr",
    logo: "/svg/hospital-iconn.svg",
    title: "Assistant of audiology",
    type: "Full Time",
    start: "Jan 2024",
    end: "Jan 2025",
    desc: "Lorem ipsum dolor sit amet consectetur. Augue dolor enim imperdiet placerat vulputate proin leo. Ipsum est nisl pulvinar libero. Quam elementum neque amet odio. In est sit varius cursus vitae velit nec. Pellentesque egestas eu sit amet accumsan lectus. Tincidunt faucibus aenean orci euismod dui. Massa eu mattis turpis pellentesque neque volutpat nunc.",
  },
  {
    id: "we3",
    company: "Medfasterrr",
    logo: "/svg/hospital-iconn.svg",
    title: "Assistant of audiology",
    type: "Full Time",
    start: "Jan 2023",
    end: "Jan 2024",
    desc: "Lorem ipsum dolor sit amet consectetur. Augue dolor enim imperdiet placerat vulputate proin leo. Ipsum est nisl pulvinar libero. Quam elementum neque amet odio. In est sit varius cursus vitae velit nec.",
  },
];

export const STATIC_WORK_HISTORY = [
  { id: "wh1", jobTitle: "Candidate Behavior", recruiterTitle: "KRV-JB-8821", rating: 4, jobType: "Regular", date: "Jan 29, 2024" },
  { id: "wh2", jobTitle: "Payment Issue",       recruiterTitle: "KRV-JB-8765", rating: 4, jobType: "Urgent",  date: "Jan 15, 2024" },
];

export const STATIC_REVIEWS = [
  { id: "rv1", company: "Candian Medical", code: "KRV_RCT-8901", rating: 5, text: "Excellent service, very punctual and safe driving.", date: "February 2, 2024" },
  { id: "rv2", company: "Medical Canada",  code: "KRV_RCT-8902", rating: 4, text: "Good ride, but vehicle could be cleaner.",           date: "February 1, 2024" },
  { id: "rv3", company: "Candian Medical", code: "KRV_RCT-8901", rating: 5, text: "Excellent service, very punctual and safe driving.", date: "February 2, 2024" },
  { id: "rv4", company: "Medical Canada",  code: "KRV_RCT-8902", rating: 4, text: "Good ride, but vehicle could be cleaner.",           date: "February 1, 2024" },
];

export const STATIC_GRIEVANCES = [
  {
    id: "gr1", ticketId: "GRV-456", category: "Candidate Behavior", relatedJob: "KRV-JB-8821",
    priority: "High",   priorityColor: "bg-red-100 text-red-600",
    status: "Resolved", statusColor: "bg-green-100 text-green-700",
    sla: "Met",         slaColor: "bg-green-100 text-green-700",
    date: "Jan 29, 2024",
    resolution: "Candidate Counselled And Warned. Fare Refunded To Passenger.",
  },
  {
    id: "gr2", ticketId: "GRV-389", category: "Payment Issue", relatedJob: "KRV-JB-8765",
    priority: "Medium", priorityColor: "bg-yellow-100 text-yellow-700",
    status: "Closed",   statusColor: "bg-green-100 text-green-700",
    sla: "Met",         slaColor: "bg-green-100 text-green-700",
    date: "Jan 15, 2024",
    resolution: "Payment Gateway Issue Resolved. Amount Refunded.",
  },
];

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
