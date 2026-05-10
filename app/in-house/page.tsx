'use client';

import { useState } from 'react';
import { Check, Copy, Mail, Plus, Send, UserCheck, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AcceptedTable, InvitedTable } from '@/app/in-house/components/InHouseStaffListTable';
import { ReferralInviteTable } from '@/app/in-house/components/ReferralTab';
import { ReferralInviteBulkModal } from '@/app/in-house/components/referral-invite-bulk-modal';
import { AppLayout } from '@/components/global/app-layout';
import { TableTabs } from '@/components/table/TableTabs';
import { MetricCard } from '@/components/ui/metric-card';
import { getRecruiterInHouseSummary } from '@/features/candidates';

type InHouseTab = 'accepted' | 'invited' | 'referral';

export default function InHousePage() {
  const [activeTab, setActiveTab] = useState<InHouseTab>('accepted');
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['recruiter-in-house-summary'],
    queryFn: async () => {
      const res = await getRecruiterInHouseSummary();
      return res.data;
    },
  });

  const formatCount = (n: number | undefined) =>
    n != null && !Number.isNaN(n) ? String(n) : '—';

  const active = formatCount(summaryData?.IN_HOUSE_ACTIVE);
  const invited = formatCount(summaryData?.IN_HOUSE_INVITED);
  const referralInvitesSent = formatCount(summaryData?.REFERRAL_INVITES_TOTAL);
  const referralRegistered = formatCount(summaryData?.REFERRAL_REGISTERED_TOTAL);
  const referralCode = summaryData?.referral_code ?? null;

  const copyReferralCode = () => {
    if (!referralCode?.trim()) return;
    void navigator.clipboard.writeText(referralCode).then(() => {
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 1500);
    });
  };

  const openReferralFromHeader = () => {
    setActiveTab('referral');
    setShowReferralModal(true);
  };

  return (
    <AppLayout padding="none">
      <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold leading-8 text-gray-900">In-House Staff</h1>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openReferralFromHeader}
              className="inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded-lg bg-[#F4781B] text-white text-sm font-semibold hover:bg-[#e06a10] transition-colors"
            >
              <Plus className="size-4" strokeWidth={2.5} aria-hidden />
              Invite candidates
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            icon={<UserCheck size={18} />}
            title="In-house active"
            value={active}
            loading={summaryLoading}
          />
          <MetricCard
            icon={<Users size={18} />}
            title="In-house invited"
            value={invited}
            loading={summaryLoading}
          />
          <MetricCard
            icon={<Send size={18} />}
            title="Referral invites sent"
            value={referralInvitesSent}
            loading={summaryLoading}
          />
          <MetricCard
            icon={<Mail size={18} />}
            title="Referral registered"
            value={referralRegistered}
            loading={summaryLoading}
          />
        </div>
        {referralCode && (
          <div className="rounded-xl border border-orange-100 bg-white px-4 py-3 text-[13px] text-gray-800 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#F4781B]">Your referral code:</span>
            <div className="inline-flex items-center gap-0.5 rounded-lg border border-gray-100 bg-gray-50/80 pl-2 pr-1 py-0.5">
              <code className="font-mono text-[13px] text-gray-900">{referralCode}</code>
              <button
                type="button"
                title="Copy referral code"
                aria-label="Copy referral code"
                onClick={copyReferralCode}
                className="p-1.5 rounded-md text-gray-500 hover:text-[#F4781B] hover:bg-orange-50 transition-colors"
              >
                {referralCopied ? <Check size={16} className="text-green-600" strokeWidth={2.5} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}

        <ReferralInviteBulkModal open={showReferralModal} onClose={() => setShowReferralModal(false)} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center px-1 border-b border-gray-100 overflow-visible">
            <TableTabs
              tabs={[
                { key: 'accepted' as const, label: 'Accepted' },
                { key: 'invited' as const, label: 'Invited' },
                { key: 'referral' as const, label: 'Referral invite' },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className=""
              wrapperClassName="flex"
              tabClassName="relative px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap"
              activeTabClassName="text-[#F4781B]"
              inactiveTabClassName="text-gray-400 hover:text-gray-600"
              activeIndicatorClassName="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F4781B] rounded-t-full"
            />
          </div>
          {activeTab === 'accepted' && <AcceptedTable />}
          {activeTab === 'invited' && <InvitedTable />}
          {activeTab === 'referral' && <ReferralInviteTable />}
        </div>
      </div>
    </AppLayout>
  );
}
