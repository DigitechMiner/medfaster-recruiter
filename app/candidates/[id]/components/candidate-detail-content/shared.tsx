"use client";

import { MetricRow } from "../CandidateDetailComponents";
import ScoreCard from "@/components/card/scorecard";

export const StarRow = ({ rating, max = 5 }: { rating: number; max?: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <svg
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

export const DocThumbnail = ({ title, name }: { title: string; name: string }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <button className="text-[#F4781B] text-xs font-semibold hover:underline">View</button>
    </div>
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-red-700 px-3 py-2">
        <p className="text-white text-xs font-bold leading-tight">{name}</p>
        <p className="text-red-200 text-[9px]">Licensed Practical Nurse</p>
      </div>
      <div className="bg-white px-3 py-3 space-y-1.5">
        <div className="flex gap-3 mb-2">
          <div className="flex-1 space-y-1">
            {[100, 80, 60].map((w, i) => (
              <div key={i} className="h-1.5 bg-gray-200 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="w-14 space-y-1">
            {[100, 80, 60, 80, 60].map((w, i) => (
              <div key={i} className="h-1.5 bg-gray-200 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        {[100, 90, 95, 80, 85, 90, 75, 85, 80, 60].map((w, i) => (
          <div key={i} className="h-1 rounded" style={{ width: `${w}%`, backgroundColor: i % 3 === 0 ? "#e5e7eb" : "#f3f4f6" }} />
        ))}
        <div className="pt-1 border-t border-gray-100 space-y-1">
          <div className="h-1.5 bg-gray-200 rounded w-2/5" />
          <div className="h-1 bg-gray-100 rounded w-full" />
          <div className="h-1 bg-gray-100 rounded w-4/5" />
        </div>
      </div>
    </div>
  </div>
);

export const PerformanceCard = ({
  title,
  score,
  metrics,
  strength,
}: {
  title: string;
  score: number;
  metrics: { label: string; value: number }[];
  strength: string;
}) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
    <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <ScoreCard category={title} score={score} maxScore={100} />
    </div>
    <div className="space-y-3 mb-5">
      {metrics.map((m, i) => (
        <MetricRow key={i} label={m.label} value={m.value} />
      ))}
    </div>
    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
      <div className="flex gap-2">
        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <div>
          <p className="text-xs font-semibold text-green-900 mb-0.5">Strengths</p>
          <p className="text-xs text-green-800">{strength}</p>
        </div>
      </div>
    </div>
  </div>
);
