'use client';

import { useEffect, useState } from 'react';
import {
  BriefcaseBusiness,
  Layers,
  UserCheck,
  Users as UsersIcon,
} from 'lucide-react';
import type { CandidateSummaryData } from '@/types';
import { MetricCard } from '@/components/ui/metric-card';
import { CandidatesPoolSection } from './components/Tab';
import { AppLayout } from '@/components/global/app-layout';
import { getCandidateSummary } from '@/features/candidates';

export default function CandidatesPage() {
  const [poolView, setPoolView] = useState<'grid' | 'list'>('grid');
  const [poolFiltersOpen, setPoolFiltersOpen] = useState(false);
  const [summary, setSummary] = useState<CandidateSummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setSummaryLoading(true);
    void getCandidateSummary()
      .then((res) => {
        if (cancelled) return;
        setSummary(res.success ? res.data : null);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hiredCount = summary?.UNIQUE_HIRED_CANDIDATES != null ? String(summary.UNIQUE_HIRED_CANDIDATES) : '—';
  const inHouseCount = summary?.IN_HOUSE_CANDIDATES != null ? String(summary.IN_HOUSE_CANDIDATES) : '—';
  const activeCount = summary?.ACTIVE_HIRED_CANDIDATES != null ? String(summary.ACTIVE_HIRED_CANDIDATES) : '—';
  const candidatePoolCount = summary?.CANDIDATE_POOL != null ? String(summary.CANDIDATE_POOL) : '—';

  return (
    <AppLayout padding="none">
      <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold leading-8 text-gray-900">Candidates</h1>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            icon={<BriefcaseBusiness size={18} />}
            title="Hired Candidates"
            value={hiredCount}
            loading={summaryLoading}
          />
          <MetricCard
            icon={<UsersIcon size={18} />}
            title="In-House Candidates"
            value={inHouseCount}
            loading={summaryLoading}
          />
          <MetricCard
            icon={<UserCheck size={18} />}
            title="Active Candidates"
            value={activeCount}
            loading={summaryLoading}
          />
          <MetricCard
            icon={<Layers size={18} />}
            title="Candidates Pool"
            value={candidatePoolCount}
            loading={summaryLoading}
          />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <CandidatesPoolSection
            view={poolView}
            filterOpen={poolFiltersOpen}
            onFilterOpenChange={setPoolFiltersOpen}
            onViewChange={setPoolView}
          />
        </div>
      </div>
    </AppLayout>
  );
}
