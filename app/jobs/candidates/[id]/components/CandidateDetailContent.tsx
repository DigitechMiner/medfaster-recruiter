"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MetricRow } from "./CandidateDetailComponents";
import { CandidateHero } from "./candidate-hero";
import { CalendarCard } from "@/components/card/calendar-card";
import SuccessModal from "@/components/modal";
import { Job, StatusType } from "@/Interface/job.types";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { CANDIDATE_DETAIL_BUTTON_CONFIGS } from "../../../constants/ui";
import ScoreCard from "@/components/card/scorecard";
import { Button } from "@/components/ui/button";
import { createRecruiterInterviewRequest } from "@/app/jobs/services/interviewApi";
 // adjust path if needed

interface CandidateDetailContentProps {
  candidate: Job;
  status: StatusType;
  onBack: () => void;
  candidateId: string; // ✅ we pass this from page.tsx
}

export const CandidateDetailContent: React.FC<CandidateDetailContentProps> = ({
  candidate,
  status,
  onBack,
  candidateId,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>("");

  const config = CANDIDATE_DETAIL_BUTTON_CONFIGS[status];

  const handleButtonClick = (buttonLabel: string, action?: string) => {
    if (action === "schedule") {
      setIsCalendarOpen(true);
    } else if (action === "reject") {
      console.log("Reject clicked");
    } else if (action === "hire") {
      console.log("Hire clicked");
    }
  };

  const handleScheduleDate = (date: string) => {
    setScheduledDate(date);
    setIsCalendarOpen(false);
    setIsSuccessOpen(true);
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    setScheduledDate("");
  };

  // ✅ NEW: Send interview request API call
 const handleSendInterviewRequest = async () => {
  try {
    // ✅ Debug: Log exact values
    console.log('candidateId received:', candidateId, typeof candidateId, 'Valid UUID?', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(candidateId));
    
    if (!candidateId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(candidateId)) {
      alert('Invalid candidate ID - check console');
      return;
    }

    // ✅ TODO: Get real job_application_id from route params or context
    const jobApplicationId = "real-job-app-id-here"; // From useParams() or applicant data

    const interviewRequest = await createRecruiterInterviewRequest({
      candidate_id: candidateId,  // ✅ This is correct
      job_application_id: jobApplicationId,
      message: "You have been shortlisted for an interview. Please book a suitable slot.",
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    console.log("Interview request created:", interviewRequest);
    alert("Interview request sent to candidate!");
  } catch (error: any) {
    console.error("Failed to send interview request:", error);
    alert(error?.response?.data?.message || error?.message || "Failed to send interview request");
  }
};


  return (
    <>
      {/* Breadcrumb + Actions */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="w-11 h-11 rounded-lg bg-white border flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Jobs</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-orange-500 font-semibold truncate max-w-[150px] sm:max-w-none">
              {candidate.doctorName}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          {config.map((btn, i) => (
            <button
              key={i}
              onClick={() => handleButtonClick(btn.label, btn.action)}
              className={`text-sm font-medium ${btn.style}`}
            >
              {btn.label}
            </button>
          ))}

          {/* ✅ NEW: Send Interview Request button */}
          <Button
            onClick={handleSendInterviewRequest}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            📅 Send Interview Request
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg gap-4">
        {/* ===== HERO CARD ===== */}
        <CandidateHero
          candidate={candidate}
          appliedTime="Applied 2 hours Ago"
        />

        {/* ===== AWARDS ===== */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Awards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 rounded p-4">
                <p className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                  John McCrae Memorial Medal
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Jan 2025</p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== SOCIAL LINKS ===== */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Social Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="border border-gray-200 rounded p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  in
                </div>
                <a
                  href="#"
                  className="text-blue-600 hover:underline text-xs sm:text-sm break-all"
                >
                  https://www.linkedin.com/in
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ===== EXPERIENCE ===== */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Experience
            </h2>
            <span className="text-orange-600 text-xs sm:text-sm font-semibold">
              5+ Years
            </span>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="pb-4 sm:pb-6 border-b border-gray-200 last:border-0 last:pb-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/svg/hospital-iconn.svg"
                      alt="company"
                      width={20}
                      height={20}
                    />
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      Medfaster
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Assistant of audiology · Full Time
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Jan 2025 - Present
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 mt-2 sm:mt-3">
                  Lorem ipsum dolor sit amet consectetur. Augue dolor enim
                  imperdiet placerat vulputate proin leo.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== EDUCATION ===== */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Education
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 rounded p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">
                      Canadian red cross university
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      Master degree · MD
                    </p>
                    <p className="text-xs text-gray-500">
                      Jan 2025 - Dec 2023
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== UPLOADED DOCUMENTS ===== */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Uploaded Documents
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {["Resume", "License", "Medical", "Certificate"].map((doc, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                    {doc}
                  </p>
                  <a
                    href="#"
                    className="text-orange-600 text-xs font-semibold hover:underline"
                  >
                    View
                  </a>
                </div>
                <div className="border border-gray-200 rounded overflow-hidden">
                  <div className="aspect-[3/4] bg-red-700 flex flex-col items-center justify-center text-white font-semibold text-xs relative p-2 text-center">
                    <div>Alex Cambell</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== PERFORMANCE CARDS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                Conversational Round
              </h3>
              <ScoreCard
                category="Conversational Round"
                score={80}
                maxScore={100}
              />
            </div>
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {[
                { label: "live face match", value: 95 },
                { label: "Communication skills", value: 25 },
                { label: "Confidence", value: 82 },
                { label: "Behavioral signals", value: 87 },
                { label: "Accuracy of answers", value: 87 },
              ].map((m, i) => (
                <MetricRow key={i} label={m.label} value={m.value} />
              ))}
            </div>
            <div className="p-3 sm:p-4 bg-green-50 rounded border border-green-200">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-green-900 mb-1">
                    Strengths
                  </p>
                  <p className="text-xs sm:text-sm text-green-800">
                    Lorem ipsum dolor sit amet consectetur.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                Behavioral Round
              </h3>
              <ScoreCard
                category="Behavioral Round"
                score={40}
                maxScore={100}
              />
            </div>
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {[
                { label: "live face match", value: 20 },
                { label: "Communication skills", value: 25 },
                { label: "Confidence", value: 32 },
                { label: "Behavioral signals", value: 10 },
                { label: "Accuracy of answers", value: 40 },
              ].map((m, i) => (
                <MetricRow key={i} label={m.label} value={m.value} />
              ))}
            </div>
            <div className="p-3 sm:p-4 bg-green-50 rounded border border-green-200">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-green-900 mb-1">
                    Strengths
                  </p>
                  <p className="text-xs sm:text-sm text-green-800">
                    Lorem ipsum dolor sit amet consectetur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== ANALYSIS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                Communication analysis
              </h3>
              <ScoreCard
                category="Communication analysis"
                score={58}
                maxScore={100}
              />
            </div>
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {[
                { label: "live face match", value: 95 },
                { label: "Communication skills", value: 25 },
                { label: "Confidence", value: 82 },
                { label: "Behavioral signals", value: 87 },
                { label: "Accuracy of answers", value: 87 },
              ].map((m, i) => (
                <MetricRow key={i} label={m.label} value={m.value} />
              ))}
            </div>
            <div className="p-3 sm:p-4 bg-green-50 rounded border border-green-200">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-green-900 mb-1">
                    Strengths
                  </p>
                  <p className="text-xs sm:text-sm text-green-800">
                    Lorem ipsum dolor sit amet consectetur.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                Accuracy of answers
              </h3>
            <ScoreCard
              category="Accuracy of answers"
              score={88}
              maxScore={100}
            />
            </div>
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {[
                { label: "live face match", value: 95 },
                { label: "Communication skills", value: 25 },
                { label: "Confidence", value: 82 },
                { label: "Behavioral signals", value: 87 },
                { label: "Accuracy of answers", value: 87 },
              ].map((m, i) => (
                <MetricRow key={i} label={m.label} value={m.value} />
              ))}
            </div>
            <div className="p-3 sm:p-4 bg-green-50 rounded border border-green-200">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-green-900 mb-1">
                    Strengths
                  </p>
                  <p className="text-xs sm:text-sm text-green-800">
                    Lorem ipsum dolor sit amet consectetur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CalendarCard
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSchedule={handleScheduleDate}
      />
      <SuccessModal
        visible={isSuccessOpen}
        onClose={handleSuccessClose}
        title="Interview Scheduled"
        message={`Interview Scheduled on ${scheduledDate}`}
        buttonText="Done"
      />
    </>
  );
};
