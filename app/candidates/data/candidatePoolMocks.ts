// app/candidates/data/candidatePoolMocks.ts

import type { CandidateCardVM } from "@/Interface/view-models";
import type { CandidateDetailsResponse } from "@/stores/api/recruiter-job-api";

// ─── Per-section CandidateCardVM arrays ────────────────────────────────────
// href must include ?mock=true so the detail page knows to skip the API call

export const MOCK_AI_POOL: CandidateCardVM[] = [
  {
    id: "mock-ai-1", application_id: "app-mock-ai-1",
    full_name: "Sarah Jenkins", initials: "SJ",
    profile_image_url: null,
    designation: "Registered Nurse", department: "Nursing",
    experience: "5+ yrs", distance: "2.4 km",
    interview_score: 91, rating: 4.9,
    work_eligibility: "Canadian Citizen",
    is_online: true, application_status: "APPLIED",
    href: "/candidates/mock-ai-1?mock=true",
  },
  {
    id: "mock-ai-2", application_id: "app-mock-ai-2",
    full_name: "Daniel Osei", initials: "DO",
    profile_image_url: null,
    designation: "Licensed Practical Nurse", department: "Long-Term Care",
    experience: "7+ yrs", distance: "4.1 km",
    interview_score: 88, rating: 4.7,
    work_eligibility: "PR",
    is_online: true, application_status: "APPLIED",
    href: "/candidates/mock-ai-2?mock=true",
  },
  {
    id: "mock-ai-3", application_id: "app-mock-ai-3",
    full_name: "Amara Wilson", initials: "AW",
    profile_image_url: null,
    designation: "RPN", department: "Psychiatry",
    experience: "4+ yrs", distance: "6.8 km",
    interview_score: 84, rating: 4.6,
    work_eligibility: "Work Permit",
    is_online: false, application_status: "SHORTLISTED",
    href: "/candidates/mock-ai-3?mock=true",
  },
];

export const MOCK_IH_POOL: CandidateCardVM[] = [
  {
    id: "mock-ih-1", application_id: "app-mock-ih-1",
    full_name: "Marcus Thompson", initials: "MT",
    profile_image_url: null,
    designation: "Personal Support Worker", department: "Home Care",
    experience: "3+ yrs", distance: "1.2 km",
    interview_score: 79, rating: 4.5,
    work_eligibility: "Canadian Citizen",
    is_online: true, application_status: "APPLIED",
    href: "/candidates/mock-ih-1?mock=true",
  },
  {
    id: "mock-ih-2", application_id: "app-mock-ih-2",
    full_name: "Lena Kovacs", initials: "LK",
    profile_image_url: null,
    designation: "HCA", department: "Disability Support",
    experience: "2+ yrs", distance: "3.5 km",
    interview_score: 72, rating: 4.3,
    work_eligibility: "PR",
    is_online: true, application_status: "APPLIED",
    href: "/candidates/mock-ih-2?mock=true",
  },
  {
    id: "mock-ih-3", application_id: "app-mock-ih-3",
    full_name: "Kevin Adeyemi", initials: "KA",
    profile_image_url: null,
    designation: "Care Coordinator", department: "Rehabilitation",
    experience: "6+ yrs", distance: "5.0 km",
    interview_score: 82, rating: 4.8,
    work_eligibility: "Canadian Citizen",
    is_online: false, application_status: "APPLIED",
    href: "/candidates/mock-ih-3?mock=true",
  },
];

export const MOCK_CA_POOL: CandidateCardVM[] = [
  {
    id: "mock-ca-1", application_id: "app-mock-ca-1",
    full_name: "Priya Nair", initials: "PN",
    profile_image_url: null,
    designation: "Physiotherapist", department: "Rehabilitation",
    experience: "5+ yrs", distance: "3.2 km",
    interview_score: 86, rating: 4.7,
    work_eligibility: "Canadian Citizen",
    is_online: true, application_status: "APPLIED",
    href: "/candidates/mock-ca-1?mock=true",
  },
  {
    id: "mock-ca-2", application_id: "app-mock-ca-2",
    full_name: "Tom Nguyen", initials: "TN",
    profile_image_url: null,
    designation: "Medical Lab Technician", department: "Laboratory",
    experience: "4+ yrs", distance: "7.3 km",
    interview_score: null, rating: 4.4,
    work_eligibility: "PR",
    is_online: true, application_status: "APPLIED",
    href: "/candidates/mock-ca-2?mock=true",
  },
  {
    id: "mock-ca-3", application_id: "app-mock-ca-3",
    full_name: "Diana Olufemi", initials: "DO",
    profile_image_url: null,
    designation: "Occupational Therapist", department: "Long-Term Care",
    experience: "8+ yrs", distance: "2.9 km",
    interview_score: 90, rating: 4.9,
    work_eligibility: "Work Permit",
    is_online: false, application_status: "SHORTLISTED",
    href: "/candidates/mock-ca-3?mock=true",
  },
];

export const MOCK_NP_POOL: CandidateCardVM[] = [
  {
    id: "mock-np-1", application_id: "app-mock-np-1",
    full_name: "James Okafor", initials: "JO",
    profile_image_url: null,
    designation: "Nurse Practitioner", department: "Geriatrics",
    experience: "9+ yrs", distance: "8.1 km",
    interview_score: 76, rating: 4.6,
    work_eligibility: "Canadian Citizen",
    is_online: false, application_status: "APPLIED",
    href: "/candidates/mock-np-1?mock=true",
  },
  {
    id: "mock-np-2", application_id: "app-mock-np-2",
    full_name: "Sophia Andreou", initials: "SA",
    profile_image_url: null,
    designation: "Respiratory Therapist", department: "Critical Care",
    experience: "6+ yrs", distance: "9.4 km",
    interview_score: 81, rating: 4.5,
    work_eligibility: "PR",
    is_online: true, application_status: "APPLIED",
    href: "/candidates/mock-np-2?mock=true",
  },
  {
    id: "mock-np-3", application_id: "app-mock-np-3",
    full_name: "Chris Mensah", initials: "CM",
    profile_image_url: null,
    designation: "Pharmacy Technician", department: "Pharmacy",
    experience: "3+ yrs", distance: "11.2 km",
    interview_score: null, rating: 4.2,
    work_eligibility: "Work Permit",
    is_online: false, application_status: "APPLIED",
    href: "/candidates/mock-np-3?mock=true",
  },
];

// ─── Map column title → mock pool (matches COLUMNS in constants.ts) ─────────
export const MOCK_POOL_BY_SECTION: Record<string, CandidateCardVM[]> = {
  "Keraeva's AI-Recommendations": MOCK_AI_POOL,
  "Instant Hires":                MOCK_IH_POOL,
  "Currently Available":          MOCK_CA_POOL,
  "Nearby Professionals":         MOCK_NP_POOL,
};

// ─── Detail page mock lookup ──────────────────────────────────────────────
// Keyed by mock candidate ID → CandidateDetailsResponse-compatible shape
// is_ai_recommended / is_instant_hire / is_currently_available drive
// getActionConfig() in candidate-hero.tsx → correct button + actionType

function makeMockDetail(
  id: string,
  firstName: string,
  lastName: string,
  designation: string,
  department: string,
  city: string,
  state: string,
  flags: {
    is_ai_recommended?:      boolean;
    is_instant_hire?:        boolean;
    is_currently_available?: boolean;
    is_hired?:               boolean;
  }
): CandidateDetailsResponse {
  return {
    data: {
      candidate: {
        id,
        first_name:         firstName,
        last_name:          lastName,
        full_name:          `${firstName} ${lastName}`,
        designation,
        department,
        city,
        state,
        preferred_location: `${city}, ${state}`,
        email:              `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone_number:       "+1 416-555-01" + Math.floor(Math.random() * 90 + 10),
        profile_image_url:  null,
        job_type:           "Part Time",
        work_eligibility:   "Canadian Citizen",
        skill:              JSON.stringify([designation, "Patient Care", "Documentation"]),
        specialty:          [designation, "General Practice"],
        specializations:    ["Long-Term Care", "Home Care", "Rehabilitation"],
        medical_industry:   "Healthcare",
        work_experiences: [
          { company: "Toronto General Hospital", title: designation },
          { company: "KeRaeva Health",           title: "Contract Nurse" },
        ],
        ...flags,
      },
    },
  } as unknown as CandidateDetailsResponse;
}

export const MOCK_CANDIDATE_DETAIL_MAP: Record<string, CandidateDetailsResponse> = {
  // AI Recommended (detail hero → "Direct Hire" primary btn + "Shortlist" secondary)
  "mock-ai-1": makeMockDetail("mock-ai-1", "Sarah",   "Jenkins", "Registered Nurse",       "Nursing",          "Toronto",   "ON", { is_ai_recommended: true }),
  "mock-ai-2": makeMockDetail("mock-ai-2", "Daniel",  "Osei",    "Licensed Practical Nurse","Long-Term Care",   "Mississauga","ON", { is_ai_recommended: true }),
  "mock-ai-3": makeMockDetail("mock-ai-3", "Amara",   "Wilson",  "RPN",                    "Psychiatry",       "Hamilton",  "ON", { is_ai_recommended: true }),

  // Instant Hires (detail hero → "Hire Instantly" btn)
  "mock-ih-1": makeMockDetail("mock-ih-1", "Marcus",  "Thompson","Personal Support Worker", "Home Care",        "Toronto",   "ON", { is_instant_hire: true }),
  "mock-ih-2": makeMockDetail("mock-ih-2", "Lena",    "Kovacs",  "HCA",                    "Disability Support","Brampton",  "ON", { is_instant_hire: true }),
  "mock-ih-3": makeMockDetail("mock-ih-3", "Kevin",   "Adeyemi", "Care Coordinator",       "Rehabilitation",   "Vaughan",   "ON", { is_instant_hire: true }),

  // Currently Available (detail hero → "Schedule A Interview" btn)
  "mock-ca-1": makeMockDetail("mock-ca-1", "Priya",   "Nair",    "Physiotherapist",        "Rehabilitation",   "Toronto",   "ON", { is_currently_available: true }),
  "mock-ca-2": makeMockDetail("mock-ca-2", "Tom",     "Nguyen",  "Medical Lab Technician", "Laboratory",       "Markham",   "ON", { is_currently_available: true }),
  "mock-ca-3": makeMockDetail("mock-ca-3", "Diana",   "Olufemi", "Occupational Therapist", "Long-Term Care",   "Oakville",  "ON", { is_currently_available: true }),

  // Nearby Professionals (detail hero → "Invite For a Job" btn)
  "mock-np-1": makeMockDetail("mock-np-1", "James",   "Okafor",  "Nurse Practitioner",     "Geriatrics",       "Scarborough","ON", {}),
  "mock-np-2": makeMockDetail("mock-np-2", "Sophia",  "Andreou", "Respiratory Therapist",  "Critical Care",    "North York","ON", {}),
  "mock-np-3": makeMockDetail("mock-np-3", "Chris",   "Mensah",  "Pharmacy Technician",    "Pharmacy",         "Etobicoke", "ON", {}),
};

// Helper: is this ID a mock candidate?
export const isMockCandidateId = (id: string) => id.startsWith("mock-");