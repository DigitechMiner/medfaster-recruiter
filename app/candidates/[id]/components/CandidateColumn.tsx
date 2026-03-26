"use client";
import Link from "next/link";
import { BoardCandidateCard } from "./BoardCandidateCard";
import { CandidateEntry } from "../../data/candidates";
import { CandidateListItem } from "@/stores/api/recruiter-job-api";

type AccentColor = "orange" | "green" | "red" | "neutral";
type ActionType = "shortlist" | "hire" | "schedule" | "invite";

interface Props {
  title: string;
  count: number;
  accentColor: AccentColor;
  dotColor: string;
  candidates: CandidateListItem[]; // ← was CandidateEntry[]
  actionType: ActionType;
}

const borderMap: Record<AccentColor, string> = {
  orange: "border-orange-300",
  green:  "border-green-400",
  red:    "border-red-400",
  neutral:"border-gray-300",
};

const viewAllColorMap: Record<AccentColor, string> = {
  orange: "text-orange-500",
  green:  "text-green-500",
  red:    "text-red-500",
  neutral:"text-gray-500",
};

export const CandidateColumn = ({
  title, count, accentColor, dotColor, candidates, actionType,
}: Props) => (
  <div className={`bg-white rounded-2xl border-2 ${borderMap[accentColor]} p-4 flex flex-col gap-3`}>
    {/* Column Header */}
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
      <h2 className="text-sm font-semibold text-gray-900 flex-1">{title}</h2>
      <span className="text-xs text-gray-400 font-medium">{count}</span>
    </div>

    {/* Cards */}
    <div className="flex flex-col gap-3">
      {candidates.map((c, i) => (
        <BoardCandidateCard key={i} c={c} actionType={actionType} />
      ))}
    </div>

    {/* View All */}
    <Link
      href={`/candidates?filter=${encodeURIComponent(title)}`}
      className={`text-xs font-medium text-center pt-1 ${viewAllColorMap[accentColor]} hover:underline`}
    >
      View all
    </Link>
  </div>
);
