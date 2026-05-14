import {
  BriefcaseBusiness,
  CalendarClock,
  Layers,
  Users,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import type { StatCounts } from "./helper";

interface SummaryProps {
  counts: StatCounts;
  loading: boolean;
}

export function Summary({ counts, loading }: SummaryProps) {
  const statCards = [
    { label: "Active Jobs", value: counts.activeJobs, icon: <Layers size={18} /> },
    { label: "Regular Job Openings", value: counts.normalJobs, icon: <BriefcaseBusiness size={18} /> },
    { label: "Urgent Shift Openings", value: counts.instantJobs, icon: <Users size={18} /> },
    { label: "Active Shifts", value: counts.activeShifts, icon: <CalendarClock size={18} /> },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <MetricCard
          key={card.label}
          icon={card.icon}
          title={card.label}
          value={card.value}
          loading={loading}
        />
      ))}
    </div>
  );
}
