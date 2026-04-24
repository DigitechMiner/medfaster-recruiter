// app/candidates/[id]/constants/staticData.ts
import type {
  CandidateDetailsResponse,
  CandidateListItem,
  CandidateDocument,
} from "@/Interface/recruiter.types";


// ─── Static document lists ────────────────────────────────────────────────────

export const STATIC_PERSONAL_DOCS: CandidateDocument[] = [
  { id: "pd1", document_type: "personal", title: "Passport" },
  { id: "pd2", document_type: "personal", title: "PR Card" },
  { id: "pd3", document_type: "personal", title: "Valid Work Permit" },
  { id: "pd4", document_type: "personal", title: "Criminal Record Check" },
];

export const STATIC_LICENSE_DOCS: CandidateDocument[] = [
  { id: "ld1", document_type: "license", title: "LPN License" },
  { id: "ld2", document_type: "license", title: "First Aid Certificate" },
  { id: "ld3", document_type: "license", title: "Professional Liability Certificate" },
  { id: "ld4", document_type: "license", title: "Flu Vaccination Certificate" },
  { id: "ld5", document_type: "license", title: "Covid Vaccination Certificate" },
  { id: "ld6", document_type: "license", title: "TB Screening Certificate" },
];


// ─── Mock candidate detail ────────────────────────────────────────────────────

export const MOCK_CANDIDATE_DETAILS: CandidateDetailsResponse = {
  success: true,
  message: "Candidate details fetched successfully",
  data: {
    candidate: {
      id:                    "cand-001",
      full_name:             "Ava Patel",
      first_name:            "Ava",
      last_name:             "Patel",
      email:                 "ava.patel@example.com",
      phone_number:          "+1 416 555 0101",
      profile_image_url:     "",
      city:                  "Toronto",
      state:                 "Ontario",
      preferred_location:    "Toronto, ON",
      job_type:              "Full-time",
      work_eligibility:      "Citizen",
      skill:                 ["Patient Care", "IV Therapy", "Wound Care"],
      specialty:             ["ICU", "Emergency"],
      specializations:       ["geriatriccare"],
      medical_industry:      "Nursing",
      completion_percentage: 85,
      ai_interview_score:    88,
      ai_interview_summary:  "Strong communicator with excellent clinical knowledge.",
      is_hired:              false,
      is_ai_recommended:     true,
      is_instant_hire:       false,
      is_currently_available: true,
      documents:             [...STATIC_PERSONAL_DOCS, ...STATIC_LICENSE_DOCS],
      work_experiences:      [],
      educations:            [],
      applications:          [],
    },
  },
};


// ─── Mock candidate list ──────────────────────────────────────────────────────

const makeMockCandidate = (
  id: string,
  overrides: Partial<CandidateListItem> = {}
): CandidateListItem => ({
  candidate_id:            id,
  first_name:              "Jane",
  last_name:               "Doe",
  full_name:               "Jane Doe",
  profile_image_url:       "",
  city:                    "Toronto",
  state:                   "Ontario",
  department:              "Nursing",
  job_title:               "Registered Nurse",
  experience_in_months:    24,
  distance:                5.2,
  best_ai_interview_score: 78,
  avg_rating_score:        4.5,
  ...overrides,
});

export const MOCK_CANDIDATES: CandidateListItem[] = [
  makeMockCandidate("cand-001", { first_name: "Ava",    last_name: "Patel",   full_name: "Ava Patel",    city: "Toronto"   }),
  makeMockCandidate("cand-002", { first_name: "Noah",   last_name: "Lee",     full_name: "Noah Lee",     city: "Vancouver" }),
  makeMockCandidate("cand-003", { first_name: "Sofia",  last_name: "Khan",    full_name: "Sofia Khan",   city: "Calgary"   }),
  makeMockCandidate("cand-004", { first_name: "Liam",   last_name: "Smith",   full_name: "Liam Smith",   city: "Ottawa"    }),
  makeMockCandidate("cand-005", { first_name: "Emma",   last_name: "Johnson", full_name: "Emma Johnson", city: "Montreal"  }),
  makeMockCandidate("cand-006", { first_name: "Oliver", last_name: "Brown",   full_name: "Oliver Brown", city: "Edmonton"  }),
  makeMockCandidate("cand-007", { first_name: "Mia",    last_name: "Davis",   full_name: "Mia Davis",    city: "Winnipeg"  }),
  makeMockCandidate("cand-008", { first_name: "James",  last_name: "Wilson",  full_name: "James Wilson", city: "Halifax"   }),
];


// ─── Helper to get a detail mock by candidate ID ──────────────────────────────

export const getMockCandidateById = (id: string): CandidateDetailsResponse => ({
  ...MOCK_CANDIDATE_DETAILS,
  data: {
    candidate: {
      ...MOCK_CANDIDATE_DETAILS.data.candidate,
      id,
    },
  },
});

export const STATIC_PERFORMANCE = {
  conversational: {
    score: 80,
    metrics: [
      { label: "Live Face Match",       value: 95 },
      { label: "Communication Skills",  value: 25 },
      { label: "Confidence",            value: 82 },
      { label: "Behavioral Signals",    value: 87 },
      { label: "Accuracy of Answers",   value: 87 },
    ],
    strength: "Strong communication presence and high face-match accuracy indicate excellent in-person reliability.",
  },
  behavioral: {
    score: 40,
    metrics: [
      { label: "Live Face Match",       value: 20 },
      { label: "Communication Skills",  value: 25 },
      { label: "Confidence",            value: 32 },
      { label: "Behavioral Signals",    value: 10 },
      { label: "Accuracy of Answers",   value: 40 },
    ],
    strength: "Shows potential in accuracy of answers with room to improve behavioral consistency.",
  },
  communication: {
    score: 58,
    metrics: [
      { label: "Live Face Match",       value: 95 },
      { label: "Communication Skills",  value: 25 },
      { label: "Confidence",            value: 82 },
      { label: "Behavioral Signals",    value: 87 },
      { label: "Accuracy of Answers",   value: 87 },
    ],
    strength: "Balanced communicator with strong technical language usage in clinical contexts.",
  },
  accuracy: {
    score: 88,
    metrics: [
      { label: "Live Face Match",       value: 95 },
      { label: "Communication Skills",  value: 25 },
      { label: "Confidence",            value: 82 },
      { label: "Behavioral Signals",    value: 87 },
      { label: "Accuracy of Answers",   value: 87 },
    ],
    strength: "Highly accurate in clinical knowledge — top 10% among all interviewed candidates.",
  },
};