'use client';
import React, { useState, useMemo } from 'react';
import { BriefcaseBusiness, CalendarClock, Layers, AlertOctagon, ClipboardList, Wallet } from 'lucide-react';
import { AppLayout }            from '@/components/global/app-layout';
import { MetricCard }           from './components/MetricCard';
import { TopIssues }            from './components/TopIssues';
import { TodaysOperations }     from './components/TodaysOperations';
import { JobsOverviewChart }    from './components/JobsOverviewChart';
import { QuickActions }         from './components/QuickActions';
import { PerformanceOverview }  from './components/PerformanceOverview';
import { WorkforceStatus }      from './components/WorkforceStatus';
import { FinancialSnapshot }    from './components/FinancialSnapshot';
import { RecentActivity }       from './components/RecentActivity';
import { BottomCandidateCards } from './components/BottomCandidateCards';
import { Top5CandidatesHired }  from './components/Top5CandidatesHired';
import { useAuthStore }         from '@/stores/authStore';
import { useRecruiterDashboard } from '@/hooks/useRecruiterData';
import { useWalletStore }       from '@/stores/walletStore';

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-100 animate-pulse ${className}`} />
);

const DashboardPage: React.FC = () => {
  const { recruiterProfile }     = useAuthStore();
  const [period, setPeriod]      = useState('This Month');
  const { dashboard, isLoading } = useRecruiterDashboard();
  const wallet                   = useWalletStore((s) => s.wallet);

  const jobs = dashboard?.jobStatusOverview;

  const firstName = recruiterProfile?.contact_person_name?.split(' ')[0]
    ?? recruiterProfile?.organization_name
    ?? 'there';

  const walletBalance = wallet ? Number(wallet.available_balance) / 100 : null;
  const lockedBalance = wallet ? Number(wallet.held_balance) / 100       : null;
  const fmtCAD = (v: number | null) =>
    v !== null ? `$${v.toLocaleString('en-CA', { minimumFractionDigits: 0 })}` : '—';

  const metrics = useMemo(() => ({
    active:   jobs?.ACTIVE   ?? 0,
    upcoming: jobs?.UPCOMING ?? 0,
    open:     jobs?.OPEN     ?? 0,
  }), [jobs?.ACTIVE, jobs?.UPCOMING, jobs?.OPEN]);

  return (
    <AppLayout padding="none">
      <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-5 xl:p-6 max-w-[1440px] mx-auto w-full">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Header
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg xl:text-xl font-semibold text-gray-900">
              Hello, {firstName} 👋
            </h1>
            <p className="text-sm text-gray-500">
              Here&apos;s what&apos;s happening in your operations today
            </p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="shrink-0 text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white shadow-sm focus:outline-none"
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 3 Months</option>
            <option>This Year</option>
          </select>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            6 Metric Cards
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {isLoading ? (
            [...Array(6)].map((_, i) => <Skeleton key={i} className="h-28" />)
          ) : (
            <>
              <MetricCard
                icon={<BriefcaseBusiness className="w-4 h-4 text-[#F4781B]" />}
                title="Active Jobs/Shifts"   value={metrics.active}
                percentChange={0.10}         isPositive={false} />
              <MetricCard
                icon={<CalendarClock className="w-4 h-4 text-[#F4781B]" />}
                title="Upcoming Jobs/Shifts" value={metrics.upcoming}
                percentChange={1.10}         isPositive={true} />
              <MetricCard
                icon={<Layers className="w-4 h-4 text-[#F4781B]" />}
                title="Open Jobs/Shifts"    value={metrics.open}
                percentChange={1.10}        isPositive={true} />
              <MetricCard
                icon={<AlertOctagon className="w-4 h-4 text-[#F4781B]" />}
                title="No-Shows"            value={0}
                valueColor="text-red-500"
                percentChange={2.10}        isPositive={false} />
              <MetricCard
                icon={<ClipboardList className="w-4 h-4 text-[#F4781B]" />}
                title="Pending Check-Ins"   value={0}
                percentChange={2.10}        isPositive={false} />
              <MetricCard
                icon={<Wallet className="w-4 h-4 text-[#F4781B]" />}
                title="Wallet Balance"
                value={fmtCAD(walletBalance)}
                subLabel={`Locked: ${fmtCAD(lockedBalance)}`}
                valueColor="text-gray-900" />
            </>
          )}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROW 1 — Top Issues | Today's Operations | Jobs Overview
            Ratio: 1fr : 2fr : 1fr
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-3 items-stretch">

  {/* Col 1 — Top Issues */}
  <TopIssues />

  {/* Col 2 — Today's Operations */}
  <TodaysOperations />

  {/* Col 3 — Chart grows to fill, Quick Actions pinned to bottom */}
  <div className="flex flex-col gap-3 h-full">
    <div className="flex-1 min-h-0">
      <JobsOverviewChart jobs={jobs} />
    </div>
    <div className="shrink-0">
      <QuickActions />
    </div>
  </div>

</div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROW 2 — Performance Overview | Workforce Status | Financial | Activity
            4 equal columns
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 items-stretch">
  <PerformanceOverview />
  <WorkforceStatus jobs={jobs} />
  <FinancialSnapshot />
  <RecentActivity />
</div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROW 3 — Nearby Professionals | Urgent Hires | Top 5 Candidates
            3 equal columns
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
          <BottomCandidateCards section="nearby" title="Nearby Professionals (Within 5 kms)" />
          <BottomCandidateCards section="urgent" title="Urgent Hires" />
          <Top5CandidatesHired />
        </div>

      </div>
    </AppLayout>
  );
};

export default DashboardPage;