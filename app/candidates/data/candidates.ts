export interface CandidateEntry {
  name: string;
  role: string;
  exp: string;
  type: string;
  dist: string;
  score: number;
  rating: number;
  verified: boolean;
  skills: string[];
  img: string;
  activityStatus: string;
  availabilityTag?: string;
  demandTag?: string;
  directHire?: boolean;
}

export const aiRecommendations: CandidateEntry[] = [
  { name: "Michael Liam", role: "Registered Nurse",      exp: "5+ yrs", type: "Part-Time", dist: "31 km", score: 95, rating: 4.8, verified: true,  skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Last Seen Yesterday", demandTag: "High Demand" },
  { name: "Michael Liam", role: "Registered Nurse",      exp: "5+ yrs", type: "Part-Time", dist: "12 km", score: 90, rating: 4.8, verified: true,  skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Active 5 min ago",    availabilityTag: "Available For Night Shift" },
  { name: "Michael Liam", role: "Registered Nurse",      exp: "5+ yrs", type: "Part-Time", dist: "20 km", score: 75, rating: 4.8, verified: true,  skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Active 7 min ago",    demandTag: "Most Hired",  directHire: true },
  { name: "Michael Liam", role: "Registered Nurse",      exp: "5+ yrs", type: "Part-Time", dist: "15 km", score: 70, rating: 4.8, verified: true,  skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Online",              availabilityTag: "Best Choice", directHire: true },
];

export const instantHires: CandidateEntry[] = [
  { name: "Michael Liam", role: "Registered Nurse", exp: "5+ yrs", type: "Part-Time", dist: "2.0 km",  score: 95, rating: 4.8, verified: true, skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Active 5 min ago",      availabilityTag: "Available Today" },
  { name: "Michael Liam", role: "Registered Nurse", exp: "5+ yrs", type: "Part-Time", dist: "13 km",  score: 95, rating: 4.8, verified: true, skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Online",                availabilityTag: "Available for Weekends" },
  { name: "Michael Liam", role: "Registered Nurse", exp: "5+ yrs", type: "Part-Time", dist: "27 km",  score: 90, rating: 4.8, verified: true, skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Last Seen Yesterday",   availabilityTag: "Available Immediately" },
  { name: "Michael Liam", role: "Registered Nurse", exp: "5+ yrs", type: "Part-Time", dist: "11 km",  score: 95, rating: 4.8, verified: true, skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Last Seen a Week Before", availabilityTag: "Available on Wednesdays" },
];

export const currentlyAvailable: CandidateEntry[] = [
  { name: "Michael Liam", role: "Registered Nurse", exp: "5+ yrs", type: "Part-Time", dist: "25 km", score: 100, rating: 4.8, verified: true, skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Online",         availabilityTag: "Available on Wed & Fri" },
  { name: "Michael Liam", role: "Registered Nurse", exp: "5+ yrs", type: "Part-Time", dist: "25 km", score: 75,  rating: 4.8, verified: true, skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Online",         availabilityTag: "Available Immediately" },
  { name: "Michael Liam", role: "Registered Nurse", exp: "5+ yrs", type: "Part-Time", dist: "25 km", score: 45,  rating: 4.8, verified: true, skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Online",         availabilityTag: "Available Now" },
  { name: "Michael Liam", role: "Registered Nurse", exp: "5+ yrs", type: "Part-Time", dist: "25 km", score: 80,  rating: 4.8, verified: true, skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Active 15 min ago", availabilityTag: "Available Today", directHire: true },
];

export const nearbyProfessionals: CandidateEntry[] = [
  { name: "Michael Liam", role: "Registered Nurse", exp: "5+ yrs", type: "Part-Time", dist: "0.2 km", score: 65, rating: 4.8, verified: true, skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Not Active Since 15 Days", demandTag: "Most Preferred" },
  { name: "Michael Liam", role: "Registered Nurse", exp: "5+ yrs", type: "Part-Time", dist: "2.3 km", score: 85, rating: 4.8, verified: true, skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Last Seen Yesterday",      demandTag: "Most Reviewed" },
  { name: "Michael Liam", role: "Registered Nurse", exp: "5+ yrs", type: "Part-Time", dist: "0.5 km", score: 40, rating: 4.8, verified: true, skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Active 5 min ago",         availabilityTag: "Available For Night Shift" },
  { name: "Michael Liam", role: "Registered Nurse", exp: "5+ yrs", type: "Part-Time", dist: "4 km",   score: 55, rating: 4.8, verified: true, skills: ["Home Care Services", "Orthopa"], img: "/img/candidates/1.png", activityStatus: "Online",                   availabilityTag: "Available For Night Shift" },
];
