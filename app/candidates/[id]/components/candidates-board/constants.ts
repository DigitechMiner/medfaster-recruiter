"use client";

export const COLUMNS = [
  {
    title: "Keraeva's AI-Recommendations",
    accentColor: "orange" as const,
    dotColor: "bg-[#F59E0B]",
    actionType: "shortlist" as const,
    leftTags: ["Online"],
    rightTags: [],
  },
  {
    title: "Instant Hires",
    accentColor: "neutral" as const,
    dotColor: "bg-[#92400E]",
    actionType: "hire" as const,
    leftTags: ["Online"],
    rightTags: [],
  },
  {
    title: "Currently Available",
    accentColor: "green" as const,
    dotColor: "bg-green-500",
    actionType: "schedule" as const,
    leftTags: ["Online"],
    rightTags: [],
  },
  {
    title: "Nearby Professionals",
    accentColor: "red" as const,
    dotColor: "bg-red-500",
    actionType: "invite" as const,
    leftTags: ["Online"],
    rightTags: [],
  },
];

export type KpiView = "none" | "candidatesPool" | "hired" | "inHouse" | "active";

export const MOCK_JOBS = [
  { name: "Michael Liam", candidateType: "In-House", dept: "Nursing",   title: "RN",  exp: "5 to 7 Years", type: "Regular", date: "12th April", timing: "20:00 PM to 03:00 AM", duration: "15 Days", status: "Active"    },
  { name: "Michael Liam", candidateType: "Hired",    dept: "Disability", title: "LPN", exp: "5 to 7 Years", type: "Urgent",  date: "15th April", timing: "20:00 PM to 03:00 AM", duration: "2 Days",  status: "Active"    },
  { name: "Michael Liam", candidateType: "Hired",    dept: "Disability", title: "HCA", exp: "5 to 7 Years", type: "Regular", date: "15th April", timing: "20:00 PM to 03:00 AM", duration: "7 Days",  status: "Completed" },
  { name: "Michael Liam", candidateType: "In-House", dept: "Disability", title: "HCA", exp: "5 to 7 Years", type: "Regular", date: "17th April", timing: "20:00 PM to 03:00 AM", duration: "1 Days",  status: "Upcoming"  },
  { name: "Michael Liam", candidateType: "Hired",    dept: "Disability", title: "HCA", exp: "5 to 7 Years", type: "Urgent",  date: "20th April", timing: "20:00 PM to 03:00 AM", duration: "12 Days", status: "Upcoming"  },
];

export const colStyles: Record<string, { wrapper: string; dot: string; viewAll: string }> = {
  orange:  { wrapper: "border-[#F4A300] bg-[#FFF9F0]", dot: "bg-[#F59E0B]",  viewAll: "text-[#F4A300]" },
  neutral: { wrapper: "border-[#92400E] bg-[#FFF5EE]", dot: "bg-[#92400E]",  viewAll: "text-[#92400E]" },
  green:   { wrapper: "border-[#22C55E] bg-[#F0FFF8]", dot: "bg-[#22C55E]",  viewAll: "text-[#16A34A]" },
  red:     { wrapper: "border-[#EF4444] bg-[#FFF5F5]", dot: "bg-[#EF4444]",  viewAll: "text-[#EF4444]" },
};
