'use client';

import { Fragment, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Briefcase, Calendar, Download, MapPin, Star, Zap } from 'lucide-react';
import type { ActionType } from '@/types';
import type { CandidateCardVM } from '@/types/view-models';
import ScoreCard from '@/components/card/scorecard';
import { BaseCard, CardHeader, CardIdentity, CardStats } from '@/components/candidate/BaseCard';
import { addInHouseCandidate } from '@/features/jobs';
import { InviteCandidateToJobModal } from '@/app/candidates/components/CandidateActionModal';
import { InHouseInviteSecondSlot, JobTitlesLine } from '@/app/candidates/components/TableView';

function JobTypePill({ type }: { type: string }) {
  return type === 'Urgent'
    ? <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">{type}</span>
    : <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-600 border border-green-200">{type}</span>;
}

function LeftPill({ text }: { text: string }) {
  const t = text.toLowerCase();
  const isOnline = t === 'online';
  const isInactive = t === 'inactive';
  const cls = isOnline
    ? 'border-green-400 text-green-600 bg-green-50'
    : isInactive
      ? 'border-gray-300 text-gray-600 bg-gray-100'
      : 'border-[#F4781B] text-[#F4781B] bg-orange-50';
  const dotCls = isOnline ? 'bg-green-500' : isInactive ? 'bg-gray-400' : 'bg-[#F4781B]';
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`} />
      {text}
    </span>
  );
}

function RightPill({ text }: { text: string }) {
  const t = text.toLowerCase();
  if (t.includes('most') || t.includes('best choice')) return <span className="inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#12B76A] text-white">{text}</span>;
  if (t.includes('night shift')) return <span className="inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-900 text-white">{text}</span>;
  if (t.includes('high demand')) return <span className="inline-flex items-center text-[10px] font-semibold px-1 py-0.5 rounded-full border border-red-500 text-red-500 bg-red-50 tracking-tight">{text}</span>;
  return <span className="inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#F4781B] text-[#F4781B] bg-orange-50">{text}</span>;
}

function Verified() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#3b82f6" className="shrink-0 inline-block ml-0.5">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function ActionButtons({
  actionType,
  score,
  onOpenModal,
  onInviteJob,
  onAddInHouse,
  addInHousePending,
  inHouseStatus,
}: {
  actionType: ActionType;
  score: number;
  onOpenModal: () => void;
  onInviteJob?: () => void;
  onAddInHouse?: () => void;
  addInHousePending?: boolean;
  inHouseStatus?: string | null;
}) {
  const open = (e: MouseEvent) => { e.stopPropagation(); onOpenModal(); };
  if (actionType === 'hire') return <button type="button" onClick={open} className="w-full flex items-center justify-center gap-1.5 bg-green-50 border border-green-400 text-green-600 text-xs font-semibold py-2 rounded-xl hover:bg-green-100 transition-colors whitespace-nowrap"><Zap size={12} fill="#16a34a" stroke="#16a34a" /> Hire Instantly</button>;
  if (actionType === 'schedule') return score >= 80 ? (
    <div className="flex flex-nowrap gap-2">
      <button type="button" onClick={open} className="flex-1 min-w-0 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium py-2 rounded-xl transition-colors whitespace-nowrap">Schedule Interview</button>
      <button type="button" onClick={open} className="flex-1 min-w-0 border border-[#F4781B] text-[#F4781B] hover:bg-orange-50 text-xs font-semibold py-2 rounded-xl transition-colors whitespace-nowrap">Direct Hire</button>
    </div>
  ) : <button type="button" onClick={open} className="w-full border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium py-2 rounded-xl transition-colors whitespace-nowrap">Schedule Interview</button>;
  if (actionType === 'invite') {
    const job = (e: MouseEvent) => { e.stopPropagation(); (onInviteJob ?? onOpenModal)(); };
    const inHouse = (e: MouseEvent) => { e.stopPropagation(); onAddInHouse?.(); };
    return (
      <div className="flex flex-nowrap gap-2">
        <button type="button" onClick={job} className="flex-1 min-w-0 flex items-center justify-center gap-1.5 border border-[#F4781B] text-[#F4781B] hover:bg-orange-50 text-xs font-semibold py-2 rounded-xl transition-colors whitespace-nowrap">
          <Calendar size={11} className="shrink-0" /> Invite job
        </button>
        <InHouseInviteSecondSlot
          variant="card"
          inHouseStatus={inHouseStatus}
          onAddInHouse={onAddInHouse ? inHouse : undefined}
          pending={addInHousePending}
        />
      </div>
    );
  }
  return score >= 75 ? (
    <div className="flex flex-nowrap gap-2">
      <button type="button" onClick={open} className="flex-1 min-w-0 bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold py-2 rounded-xl transition-colors whitespace-nowrap">Shortlist</button>
      <button type="button" onClick={open} className="flex-1 min-w-0 border border-[#F4781B] text-[#F4781B] hover:bg-orange-50 text-xs font-semibold py-2 rounded-xl transition-colors bg-orange-50/50 whitespace-nowrap">Direct Hire</button>
    </div>
  ) : <button type="button" onClick={open} className="w-full bg-[#F4781B] hover:bg-[#e06a10] text-white text-xs font-semibold py-2 rounded-xl transition-colors whitespace-nowrap">Shortlist</button>;
}

function candidateStatusPillText(c: CandidateCardVM): string {
  if (c.is_online) return 'Online';
  if (c.work_eligibility) return c.work_eligibility;
  if (c.is_active === false) return 'Inactive';
  return 'Active';
}

export function BoardCandidateCard({ c, actionType, leftTag, rightTag }: { c: CandidateCardVM; actionType: ActionType; leftTag?: string; rightTag?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [inviteJobOpen, setInviteJobOpen] = useState(false);
  const [addInHousePending, setAddInHousePending] = useState(false);
  void showModal;
  const score = c.interview_score ?? 0;
  const handleInviteJob = () => { setInviteJobOpen(true); };
  const handleAddInHouse = async () => {
    if (addInHousePending) return;
    setAddInHousePending(true);
    try {
      await addInHouseCandidate(c.id);
      toast.success('Candidate added to in-house');
      await queryClient.invalidateQueries({ queryKey: ['inhouse-candidates'] });
      await queryClient.invalidateQueries({ queryKey: ['recruiter-candidates'] });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : 'Could not add to in-house');
      toast.error(msg);
    } finally {
      setAddInHousePending(false);
    }
  };
  const hasScore = c.interview_score !== null;
  const pillLeft = leftTag ?? candidateStatusPillText(c);
  const pillRight = rightTag ?? null;
  return (
    <Fragment>
    <BaseCard onClick={() => router.push(c.href)} className="min-w-[300px] flex flex-col gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer">
      <CardHeader className="flex items-center justify-between gap-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap"><LeftPill text={pillLeft} /></div>
        {pillRight && <RightPill text={pillRight} />}
      </CardHeader>
      <CardIdentity className="flex items-start gap-2">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-50 shrink-0 border border-gray-100">
          {c.profile_image_url ? <Image src={c.profile_image_url} alt={c.full_name} width={40} height={40} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#F4781B]">{c.initials}</div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight">{c.full_name}<Verified /></p>
          <div className="mt-1 min-w-0">
            <JobTitlesLine designation={c.designation} jobTitleLabelCount={c.job_title_labels.length} />
          </div>
        </div>
        {hasScore ? <ScoreCard category="good" score={score} maxScore={100} /> : <ScoreCard category="none" score={0} maxScore={100} noBackground />}
      </CardIdentity>
      <CardStats className="flex items-center gap-2 text-[10px] text-gray-500 flex-wrap">
        <span className="flex items-center gap-1"><Briefcase size={10} className="text-gray-400" /> {c.experience}</span>
        <span className="text-gray-300">|</span>
        <span className="flex items-center gap-0.5"><MapPin size={9} className="text-green-500" /> {c.distance}</span>
        <span className="text-gray-300">|</span>
        <span className="flex items-center gap-0.5"><Star size={9} className="fill-yellow-400 text-yellow-400" /> {c.rating ? `${c.rating}/5` : 'N/A'}</span>
      </CardStats>
      <div onClick={(e) => e.stopPropagation()}>
        <ActionButtons
          actionType={actionType}
          score={score}
          onOpenModal={() => setShowModal(true)}
          onInviteJob={actionType === 'invite' ? handleInviteJob : undefined}
          onAddInHouse={actionType === 'invite' ? handleAddInHouse : undefined}
          addInHousePending={actionType === 'invite' ? addInHousePending : undefined}
          inHouseStatus={actionType === 'invite' ? c.in_house_status : undefined}
        />
      </div>
    </BaseCard>
    {inviteJobOpen && (
      <InviteCandidateToJobModal
        candidate={{ id: c.id, full_name: c.full_name }}
        applicationId={c.application_id}
        onClose={() => setInviteJobOpen(false)}
        onActionSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ['recruiter-candidates'] });
        }}
      />
    )}
    </Fragment>
  );
}

export function HiredCandidateCard({ c, leftTag, rightTag }: { c: CandidateCardVM; leftTag?: string; rightTag?: string }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  void showModal;
  const isAssigned = (leftTag ?? 'Assigned').toLowerCase().includes('assigned');
  return (
    <BaseCard onClick={() => router.push(c.href)} className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer">
      <CardHeader className="flex items-center justify-between gap-1">
        {isAssigned ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-300"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Assigned</span> : <span className="inline-flex items-center gap-1 text-[10px] font-light px-2 py-0.5 rounded-full bg-[#079455] text-white border">Active</span>}
        {rightTag && <JobTypePill type={rightTag} />}
      </CardHeader>
      <CardIdentity className="flex items-start gap-2">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 shrink-0 border border-gray-100">
          {c.profile_image_url ? <Image src={c.profile_image_url} alt={c.full_name} width={40} height={40} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#F4781B]">{c.initials}</div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight">{c.full_name}</p>
          <div className="mt-1 min-w-0">
            <JobTitlesLine designation={c.designation} jobTitleLabelCount={c.job_title_labels.length} />
          </div>
          <CardStats className="flex items-center gap-2 text-[10px] text-gray-500 flex-wrap mt-1">
            <span className="flex items-center gap-1"><Briefcase size={10} className="text-gray-400" /> {c.experience}</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-0.5"><MapPin size={9} className="text-green-500" /> {c.distance}</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-0.5"><Star size={9} className="fill-yellow-400 text-yellow-400" /> {c.rating ? `${c.rating}/5` : 'N/A'}</span>
          </CardStats>
        </div>
        {c.interview_score !== null && <ScoreCard category="good" score={c.interview_score} maxScore={100} />}
      </CardIdentity>
      <div className="flex flex-nowrap gap-2" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="flex-1 min-w-0 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium py-1 rounded-md transition-colors flex items-center justify-center gap-1 whitespace-nowrap"><Download size={11} /> Export Profile</button>
        <button type="button" onClick={() => setShowModal(true)} className="flex-1 min-w-0 bg-[#F4781B] hover:bg-[#e06a10] text-white text-sm font-light py-1 rounded-md transition-colors flex items-center justify-center whitespace-nowrap">Direct Hire</button>
      </div>
    </BaseCard>
  );
}
