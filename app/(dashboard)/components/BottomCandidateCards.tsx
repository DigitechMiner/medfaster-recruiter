"use client";
import Image from "next/image";
import { MapPin, Briefcase, Zap, CalendarDays, BadgeCheck } from "lucide-react";
import { useState } from "react";

const available = [
  { name: "Michael Liam", role: "Registered Nurse",     exp: "5+ yrs", type: "Part-Time", dist: "0.5 km", score: 95, verified: true,  badge: "Hire Instantly", badge2: "Available Today",  img: "/img/candidates/1.png" },
  { name: "Tom Hardy",    role: "Health Assistant",     exp: "2 yrs",  type: "Full-Time", dist: "35 km",  score: 56, verified: false, badge: null,             badge2: "Available Today",  img: "/img/candidates/2.png" },
  { name: "Varun Kapur",  role: "Health Care Assistant",exp: "5+ yrs", type: "Part-Time", dist: "26 km",  score: 40, verified: false, badge: null,             badge2: null,               img: "/img/candidates/3.png" },
];

const nearby = [
  { name: "Michael Liam", role: "Registered Nurse",     exp: "5+ yrs",  type: "Part-Time", dist: "0.5 km", score: 95, verified: true,  badge: "Hire Instantly", badge2: "Available Today",       img: "/img/candidates/1.png" },
  { name: "Rajiv Bhatia", role: "Registered Nurse",     exp: "10+ yrs", type: "Freelance", dist: "3 km",   score: 80, verified: true,  badge: null,             badge2: "Available For Weekends", img: "/img/candidates/4.png" },
  { name: "Jack Kirby",   role: "Health Care Assistant",exp: "5+ yrs",  type: "Part-Time", dist: "2.2 km", score: 80, verified: false, badge: null,             badge2: null,                    img: "/img/candidates/3.png" },
];

const urgent = [
  { name: "Michael Liam", role: "Registered Nurse",         exp: "5+ yrs", type: "Part-Time", dist: "0.5 km", score: 95,  verified: true,  badge: "Hire Instantly", badge2: null, img: "/img/candidates/1.png" },
  { name: "Rajiv Bhatia", role: "Licensed Practical Nurse", exp: "4+ yrs", type: "Part-Time", dist: "23 km",  score: 100, verified: true,  badge: null,             badge2: null, img: "/img/candidates/4.png" },
  { name: "Donald Falua", role: "Health Care Assistant",    exp: "5+ yrs", type: "Part-Time", dist: "27 km",  score: 95,  verified: false, badge: null,             badge2: null, img: "/img/candidates/5.png" },
];

// ── Only CSS changed: flex-row, arc SVG added, colors updated ──
const ScoreBadge = ({ score }: { score: number }) => {
  const isGreen  = score >= 80;
  const isOrange = score >= 60 && score < 80;
  const arcColor   = isGreen ? "#22c55e" : isOrange ? "#f97316" : "#ef4444";
  const textColor  = isGreen ? "text-green-600" : isOrange ? "text-orange-500" : "text-red-500";
  const borderColor = isGreen ? "border-green-500" : isOrange ? "border-orange-400" : "border-red-400";

  const size = 32;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className={`flex flex-row items-center gap-1.5 px-2 py-1.5 rounded-xl border-2 ${borderColor} shrink-0`}>
      {/* Arc SVG */}
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} className="shrink-0">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={arcColor} strokeWidth={strokeWidth}
          strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round" />
      </svg>
      {/* Text */}
      <div className="flex flex-col items-start">
        <span className={`text-sm font-bold leading-none ${textColor}`}>{score}/100</span>
        <span className="text-[10px] text-gray-400 leading-tight">Score</span>
      </div>
    </div>
  );
};

const CandidateCard = ({ c }: { c: typeof available[0] }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-orange-200 hover:bg-orange-50/30 transition-colors">
    {/* Photo: rounded-xl + bg-orange-50 instead of rounded-full + bg-gray-100 */}
    <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 shrink-0">
      <Image src={c.img} alt={c.name} width={40} height={40} className="object-cover w-full h-full" />
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold text-gray-900">{c.name}</span>
        {/* BadgeCheck instead of ✔ text */}
        {c.verified && <BadgeCheck className="w-4 h-4 shrink-0" fill="#22c55e" color="white" />}
      </div>
      <p className="text-xs text-orange-500 font-medium">{c.role}</p>

      {/* | separator instead of · */}
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className="flex items-center gap-0.5 text-[11px] text-gray-500"><Briefcase size={10} />{c.exp}</span>
        <span className="text-[11px] text-gray-300">|</span>
        <span className="text-[11px] text-gray-500">{c.type}</span>
        <span className="flex items-center gap-0.5 text-[11px] text-gray-500"><MapPin size={10} className="text-green-500" />{c.dist}</span>
      </div>

      <div className="flex gap-1.5 mt-1.5 flex-wrap">
        {/* Hire Instantly: bg-green-50, green text, orange Zap, rounded-lg */}
        {c.badge && (
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
            <Zap size={9} className="text-orange-500" fill="#f97316" />{c.badge}
          </span>
        )}
        {/* Available badges: bg-orange-100, orange text, rounded-lg */}
        {c.badge2 && (
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-orange-500 bg-orange-100 px-2 py-0.5 rounded-lg">
            <CalendarDays size={9} />{c.badge2}
          </span>
        )}
      </div>
    </div>

    <ScoreBadge score={c.score} />
  </div>
);

export const BottomCandidateCards = () => {
  const [radius, setRadius] = useState("Within 5km");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Currently Available</h2>
        </div>
        <div className="flex flex-col gap-3">
          {available.map((c) => <CandidateCard key={c.name + c.role} c={c} />)}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Nearby Professionals</h2>
          <select value={radius} onChange={(e) => setRadius(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600">
            <option>Within 5km</option>
            <option>Within 10km</option>
            <option>Within 25km</option>
          </select>
        </div>
        <div className="flex flex-col gap-3">
          {nearby.map((c) => <CandidateCard key={c.name + c.role} c={c as typeof available[0]} />)}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Urgent Hire (Pre-Verified)</h2>
        </div>
        <div className="flex flex-col gap-3">
          {urgent.map((c) => <CandidateCard key={c.name + c.role} c={c as typeof available[0]} />)}
        </div>
      </div>
    </div>
  );
};
