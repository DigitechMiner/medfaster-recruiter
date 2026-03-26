"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Zap, Calendar } from "lucide-react";
import { CandidateListItem } from "@/stores/api/recruiter-job-api";

type ActionType = "shortlist" | "hire" | "schedule" | "invite";

// ── Score Badge ────────────────────────────────────────────────
const ScoreBadge = ({ score }: { score: number }) => {
  const isGreen  = score >= 80;
  const isOrange = score >= 60 && score < 80;
  const arcColor    = isGreen ? "#22c55e" : isOrange ? "#f97316" : "#ef4444";
  const textColor   = isGreen ? "text-green-600" : isOrange ? "text-orange-500" : "text-red-500";
  const borderColor = isGreen ? "border-green-500" : isOrange ? "border-orange-400" : "border-red-400";

  const size = 30, sw = 3, r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const prog = (score / 100) * circ;

  return (
    <div className={`flex flex-row items-center gap-1 px-2 py-1 rounded-xl border-2 ${borderColor} shrink-0`}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={arcColor} strokeWidth={sw}
          strokeDasharray={`${prog} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="flex flex-col items-start">
        <span className={`text-xs font-bold leading-none ${textColor}`}>{score}/100</span>
        <span className="text-[9px] text-gray-400 leading-tight">Score</span>
      </div>
    </div>
  );
};

// ── Action Buttons ─────────────────────────────────────────────
const ActionButtons = ({
  actionType,
  onNavigate,
}: {
  actionType: ActionType;
  candidateId: string;
  onNavigate: (e: React.MouseEvent) => void;
}) => {
  if (actionType === "hire") {
    return (
      <button
        onClick={(e) => e.stopPropagation()}
        className="w-full flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
      >
        <Zap size={12} fill="white" /> Hire Instantly
      </button>
    );
  }

  if (actionType === "schedule") {
    return (
      <button
        onClick={(e) => e.stopPropagation()}
        className="w-full text-xs font-medium border border-gray-200 rounded-xl py-1.5 text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Schedule a Interview
      </button>
    );
  }

  if (actionType === "invite") {
    return (
      <button
        onClick={(e) => e.stopPropagation()}
        className="w-full flex items-center justify-center gap-1.5 border border-orange-300 text-orange-500 text-xs font-semibold py-2 rounded-xl hover:bg-orange-50 transition-colors"
      >
        <Calendar size={11} /> Invite For a Job
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={(e) => e.stopPropagation()}
        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
      >
        Shortlist
      </button>
      <button
        onClick={onNavigate}
        className="flex-1 border border-orange-300 text-orange-500 text-xs font-semibold py-2 rounded-xl hover:bg-orange-50 transition-colors"
      >
        Direct Hire
      </button>
    </div>
  );
};

// ── Main Card ──────────────────────────────────────────────────
export const BoardCandidateCard = ({
  c,
  actionType,
}: {
  c: CandidateListItem;
  actionType: ActionType;
}) => {
  const router = useRouter();

const name = c.full_name || `${c.first_name} ${c.last_name ?? ''}`.trim();
const role = c.specialty?.[0]
  ?? c.medical_industry 
  ?? 'Healthcare Professional';
const location = [c.city, c.state].filter(Boolean).join(', ') || 'Location not set';
const score = c.highest_job_interview_score ?? c.highest_interview_score ?? 0;

const shiftTag = c.availability?.[0] ?? null;


  // ✅ both handlers were missing
  const navigateToDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/candidates/${c.id}`);
  };

  const handleCardClick = () => {
    router.push(`/candidates/${c.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 hover:border-orange-200 hover:bg-orange-50/20 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between">
  <span className="text-[10px] text-orange-400 font-medium">
    {c.work_eligibility ?? ''}
  </span>
  {shiftTag && (
    <span className="text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full capitalize">
      {shiftTag}
    </span>
  )}
</div>

      {/* Identity row */}
      <div className="flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-xl overflow-hidden bg-orange-50 shrink-0">
          <Image
            src={c.profile_image_url || "/svg/Photo.svg"}
            alt={name}
            width={36}
            height={36}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-900 truncate block">
            {name}
          </span>
          <p className="text-[11px] text-orange-500 font-medium">{role}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
              <MapPin size={9} className="text-green-500" />
              {location}
            </span>
          </div>
        </div>

        {score > 0 && <ScoreBadge score={score} />}
      </div>

      <ActionButtons
        actionType={actionType}
        candidateId={c.id}
        onNavigate={navigateToDetail}
      />
    </div>
  );
};
