export type NavLink = { label: string; href: string };
export const landingNavLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Why KeRaeva?', href: '/coming-soon' },
  { label: 'Post a Job', href: '/jobs' },
  { label: 'Our Subscriptions', href: '/coming-soon' },
  { label: 'Hiring Blog', href: '/coming-soon' },
];

export type CompanyLogo = { src: string; alt: string };
export const companyLogos: CompanyLogo[] = [
  { src: "/img/company/canadian-health-logo.png", alt: "Canadian Health" },
  { src: "/img/company/canadian-specialist-hospital-logo.png", alt: "Canadian Specialist Hospital" },
  { src: "/img/company/medical-canada-logo.png", alt: "Medical Canada" },
  { src: "/img/company/canadian-red-cross-logo.png", alt: "Canadian Red Cross" },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
};
export const testimonials: Testimonial[] = [
  {
    quote:
      "The promise of 100% verified healthcare staff is real. We've had zero compliance issues since switching over, which gives our entire team peace of mind. Totally worth it.",
    name: "Maria R.",
    role: "Compliance Officer",
    avatar: "/img/testimonials/michael.png",
    rating: 3,
  },
  {
    quote:
      "KeRaeva cut our hiring time from 6 weeks to just 10 days. The AI matching is incredibly accurate and saves us countless hours of screening.",
    name: "Dr. James Chen",
    role: "Chief Medical Officer",
    avatar: "/img/testimonials/sarah.png",
    rating: 5,
  },
  {
    quote:
      "Finally, a platform that understands healthcare recruitment. The credential verification alone is worth the investment.",
    name: "Sarah Mitchell",
    role: "HR Director",
    avatar: "/img/testimonials/sarah.png",
    rating: 4,
  },
];

export type DashboardFeature = { screen: string; title: string };
export const dashboardFeatures: DashboardFeature[] = [
  { screen: "/img/dashboard/feature-candidate-pipeline.png", title: "Candidate Piepline" },
  { screen: "/img/dashboard/feature-ai-ranking.png", title: "AI Ranking" },
  { screen: "/img/dashboard/feature-interview-scheduling.png", title: "Interview Scheduling" },
  { screen: "/img/dashboard/feature-notes-logs.png", title: "Notes & Logs" },
  { screen: "/img/dashboard/feature-analytics-dashboard.png", title: "Analytics Dashboard" },
  { screen: "/img/dashboard/feature-communication-tools.png", title: "Communication Tools" },
];

export type HiringStep = { icon?: any; title: string; description: string };
export const hiringSteps: HiringStep[] = [
  {
    title: "Automated Screening",
    description:
      "Our AI instantly parses resumes, verifies licenses, and filters candidates based on your exact criteria, eliminating hours of manual review.",
  },
  {
    title: "Smart Matching",
    description:
      "Receive a pre-vetted shortlist of top-fit candidates in seconds. Our algorithm ranks professionals by skill, experience, and availability",
  },
  {
    title: "Predictive Insights",
    description:
      "Forecast a candidate's potential performance using data-driven insights, helping you make more confident hiring decisions.",
  },
  {
    title: "AI-Powered Interviews",
    description:
      "Automatically and impartially assess a candidate's communication skills and professionalism with our standardized behavioral interviews.",
  },
  {
    title: "Built-in Trust Layer",
    description:
      "Hire with confidence. Every candidate profile includes verified credentials and a performance rating history from past roles on our platform.",
  },
];

export type FooterLink = { label: string; href: string };
export type FooterColumn = { title: string; links: FooterLink[] };
export const landingFooterColumns: FooterColumn[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Hospitals & Recruiters', href: '#hospitals-recruiters' },
      { label: 'Medical Professionals', href: '#medical-professionals' },
      { label: 'Patients', href: '#patients' },
      { label: 'AI Features', href: '#ai-features' },
      { label: 'Subscription Plans', href: '#subscription-plans' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About KeRaeva', href: '#about' },
      { label: 'Mission & Vision', href: '#mission-vision' },
      { label: 'Our Team', href: '#team' },
      { label: 'Careers', href: '#careers' },
      { label: 'Blog', href: '#blog' },
      { label: 'Contact Us', href: '#contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '#help-center' },
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms & Conditions', href: '#terms' },
      { label: 'Refund Policy', href: '#refund' },
      { label: 'Data Protection (HIPAA/GDPR)', href: '#data-protection' },
      { label: 'Report an Issue', href: '#report-issue' },
    ],
  },
];


