"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Filter, Users } from "lucide-react";
import { JobDescriptionModal, useJobDescriptionModal } from "./JobDescriptionModal";
import { EditInterviewQuestionsModal } from "./EditInterviewQuestionsModal";
import { useCandidatesList } from "@/hooks/useCandidate";
import {
  convertExperienceToFrontend,
  convertJobTypeToFrontend,
  convertQualificationToFrontend,
  convertSpecializationToFrontend,
} from "@/utils/constant/metadata";
import {
  CalIcon,
  Candidate,
  calcShiftHours,
  ClockIcon,
  DollarIcon,
  formatJobDate,
  formatTime,
  getCountdown,
  getInitialInterviewQuestions,
  getProvinceLabel,
  getStatusLabel,
  InfoItem,
  LayersIcon,
  Props,
  TabKey,
  TimerIcon,
  TABS,
  toCandidate,
  LocIcon,
} from "./normal-job-detail/shared";
import { CandidatesTable, TablePagination, ViewToggle } from "./normal-job-detail/list-view";
import { KanbanSection } from "./normal-job-detail/kanban-view";

export const NormalJobDetail: React.FC<Props> = ({ job, jobId, onCloseJob }) => {
  const router = useRouter();
  const modal = useJobDescriptionModal();
  const hasAI = job.normalJob?.ai_interview === true;

  const [view, setView] = useState<"list" | "kanban">("list");
  const [activeTab, setActiveTab] = useState<TabKey>("applied");
  const [showQModal, setShowQModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useCandidatesList({
    page,
    limit,
    job_id: jobId,
    ...(activeTab !== "applied" && { candidate_status: activeTab }),
  });

  const candidates: Candidate[] = (data?.candidates ?? []).map(toCandidate);
  const totalCount = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const visibleTabs = TABS.filter((tab) => !tab.aiOnly || hasAI);
  const hasSpecs = job.normalJob?.specializations && job.normalJob.specializations.length > 0;
  const hasQuals = job.normalJob?.qualifications && job.normalJob.qualifications.length > 0;

  const provinceLabel = getProvinceLabel(job.province);
  const location = [job.city, provinceLabel].filter(Boolean).join(", ");

  const infoItems: InfoItem[] = [
    location
      ? {
          icon: <LocIcon />,
          text: `${location}, Canada`,
        }
      : null,
    {
      icon: <ClockIcon />,
      text: convertJobTypeToFrontend(job.job_type),
    },
    {
      icon: <DollarIcon />,
      node: (
        <span>
          <strong className="text-gray-900 font-bold">
            ${job.pay_per_hour_cents ? (job.pay_per_hour_cents / 100).toFixed(2) : "—"}
          </strong>
          /hr
        </span>
      ),
      text: null,
    },
  ].filter(Boolean) as InfoItem[];

  const normalJob = job.normalJob;
  const startDate = job.start_date ?? null;
  const checkIn = job.check_in_time ?? null;
  const checkOut = job.check_out_time ?? null;

  const statCards = [
    {
      label: "Total Requirements",
      value: job.no_of_hires_required ?? "N/A",
      sub: totalCount > 0 ? `${totalCount} Candidates Applied` : "None Applied",
      icon: <LayersIcon />,
    },
    {
      label: "Experience Required",
      value: convertExperienceToFrontend(normalJob?.years_of_experience) || "N/A",
      sub: null,
      icon: <TimerIcon />,
    },
    {
      label: "Job Start Date",
      value: formatJobDate(startDate),
      sub: getCountdown(startDate),
      icon: <CalIcon />,
    },
    {
      label: "Job Timings",
      value: checkIn && checkOut ? `${formatTime(checkIn)} to ${formatTime(checkOut)}` : "N/A",
      sub: calcShiftHours(checkIn, checkOut) || null,
      icon: <ClockIcon />,
    },
  ];

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-sm">
            <button onClick={() => router.push("/jobs")} className="p-1 -ml-1 hover:bg-gray-100 rounded">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <span className="text-gray-700 font-semibold cursor-pointer hover:text-gray-900" onClick={() => router.push("/jobs")}>Jobs</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">{jobId}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 rounded-full text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200">
              {getStatusLabel(job.status)}
            </span>
            <span className="px-4 py-1.5 rounded-full text-sm font-medium text-green-600 bg-green-50 border border-green-200">Regular</span>
          </div>
        </div>

        <div className="flex items-start justify-between gap-4 mb-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-gray-900">{job.job_title}</h1>
            {job.department && (
              <span className="px-3 py-1 rounded-full text-sm text-gray-600 border border-gray-300 bg-white">
                {job.department} Department
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={modal.open}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
            >
              <FileText size={15} className="text-gray-500" />
              Job Description
            </button>
            {hasAI && (
              <button
                onClick={() => setShowQModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              >
                <Users size={15} className="text-gray-500" />
                Interview Questions
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-y-1 text-sm text-gray-600 pb-3">
          {infoItems.map((item, index) => (
            <React.Fragment key={index}>
              <span className="flex items-center gap-1.5">
                {item.icon}
                {item.node ?? item.text}
              </span>
              {index < infoItems.length - 1 && <span className="mx-3 text-gray-300">|</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="h-px bg-gray-100 mb-3" />

        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-[#F4781B]">Required Specialization :</span>
          {hasSpecs
            ? job.normalJob!.specializations!.map((specialization, index) => (
                <span key={index} className="px-3 py-1 rounded-full text-xs text-gray-700 bg-white border border-gray-200">
                  {convertSpecializationToFrontend(String(specialization))}
                </span>
              ))
            : <span className="text-sm text-gray-400">N/A</span>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#F4781B]">Required Qualification :</span>
          {hasQuals
            ? job.normalJob!.qualifications!.map((qualification, index) => (
                <span key={index} className="px-3 py-1 rounded-full text-xs text-gray-700 bg-white border border-gray-200">
                  {convertQualificationToFrontend(qualification)}
                </span>
              ))
            : <span className="text-sm text-gray-400">N/A</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl px-5 py-4 border border-gray-200 flex flex-col gap-1.5 relative">
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              {card.icon}
            </div>
            <p className="text-xs text-gray-500 pr-10">{card.label}</p>
            <p className="text-2xl font-extrabold text-gray-900 leading-tight">{card.value}</p>
            {card.sub && <p className="text-xs text-gray-400">{card.sub}</p>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {view === "list" ? (
          <>
            <div className="flex items-center justify-between px-5 pt-4 border-b border-gray-100">
              <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? "border-[#F4781B] text-[#F4781B]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    {tab.key === "ai_interviewing" && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={activeTab === tab.key ? "#F4781B" : "#9ca3af"}>
                        <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2zm6 10l.73 2.18L21 15l-2.27.82L18 18l-.73-2.18L15 15l2.27-.82L18 12zm-12 0l.73 2.18L9 15l-2.27.82L6 18l-.73-2.18L3 15l2.27-.82L6 12z" />
                      </svg>
                    )}
                    {tab.label}
                  </button>
                ))}
              </div>
              <ViewToggle view={view} onChange={setView} />
            </div>

            <div className="p-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <CandidatesTable tab={activeTab} candidates={candidates} isLoading={isLoading} />
              </div>
            </div>

            <TablePagination
              page={page}
              totalPages={totalPages}
              total={totalCount}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </>
        ) : (
          <>
            <div className="flex items-center justify-end gap-2 px-5 pt-4 pb-3 border-b border-gray-100">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                <Filter size={14} />
                Filter
              </button>
              <ViewToggle view={view} onChange={setView} />
            </div>
            <KanbanSection hasAI={hasAI} jobId={jobId} />
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pb-4">
        <button onClick={onCloseJob} className="px-6 py-2 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 font-medium">
          Close This Job
        </button>
        <button onClick={() => router.push(`/jobs/edit/${jobId}`)} className="px-6 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 font-medium">
          Edit Job
        </button>
      </div>

      <JobDescriptionModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        job={job}
        onUpdate={(desc) => console.log("Saved:", desc)}
      />

      <EditInterviewQuestionsModal
        isOpen={showQModal}
        onClose={() => setShowQModal(false)}
        initialQuestions={getInitialInterviewQuestions(job)}
        onSave={async (questions) => { console.log("Saved questions:", questions); }}
      />
    </div>
  );
};
