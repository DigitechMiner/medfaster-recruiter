'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/global/navbar';
import { ScoreBox } from './ui';
import { PerformanceCard, MetricRow } from './CandidateDetailComponents';
import { CandidateHero } from './candidate-hero';
import { ScheduleModal } from './schedule-modal';
import SuccessModal from '../../create/components/job-success-modal';
import { Job, StatusType } from '../types/job.types';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/global/footer';

interface ButtonConfig {
  label: string;
  style: string;
  action?: 'schedule' | 'reject' | 'hire';
}

interface CandidateDetailPageProps {
  candidate: Job;
  status: StatusType;
  onBack: () => void;
}

export const CandidateDetailPage: React.FC<CandidateDetailPageProps> = ({ candidate, status, onBack }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');

  const buttonConfigs: Record<StatusType, ButtonConfig[]> = {
    applied: [
      { label: 'Reject', style: 'border-2 border-red-500 text-red-500 px-6 py-2 hover:bg-red-50 rounded', action: 'reject' },
      { label: 'Schedule', style: 'border border-gray-300 text-gray-700 px-6 py-2 hover:bg-gray-50 rounded bg-white', action: 'schedule' },
      { label: 'Hire', style: 'bg-orange-500 text-white px-6 py-2 hover:bg-orange-600 rounded', action: 'hire' }
    ],
    shortlisted: [
      { label: 'Reject', style: 'border-2 border-red-500 text-red-500 px-6 py-2 hover:bg-red-50 rounded', action: 'reject' },
      { label: 'Schedule', style: 'border border-gray-300 text-gray-700 px-6 py-2 hover:bg-gray-50 rounded bg-white', action: 'schedule' },
      { label: 'Hire', style: 'bg-orange-500 text-white px-6 py-2 hover:bg-orange-600 rounded', action: 'hire' }
    ],
    interviewing: [
      { label: 'Reject', style: 'border-2 border-red-500 text-red-500 px-6 py-2 hover:bg-red-50 rounded', action: 'reject' },
      { label: 'Interviewing', style: 'border border-orange-400 text-orange-500 px-6 py-2 hover:bg-orange-50 rounded bg-white' },
      { label: 'Hire', style: 'bg-orange-500 text-white px-6 py-2 hover:bg-orange-600 rounded', action: 'hire' }
    ],
    hired: [
      { label: 'Reject', style: 'border-2 border-red-500 text-red-500 px-6 py-2 hover:bg-red-50 rounded', action: 'reject' },
      { label: 'Hired', style: 'bg-green-500 text-white px-6 py-2 hover:bg-green-600 rounded cursor-not-allowed opacity-90' }
    ]
  };

  const config = buttonConfigs[status];

  const handleButtonClick = (buttonLabel: string, action?: string) => {
    if (action === 'schedule') {
      setIsCalendarOpen(true);
    } else if (action === 'reject') {
      console.log('Reject clicked');
    } else if (action === 'hire') {
      console.log('Hire clicked');
    }
  };

  const handleScheduleDate = (date: string) => {
    setScheduledDate(date);
    setIsCalendarOpen(false);
    setIsSuccessOpen(true);
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    setScheduledDate('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="px-8 py-4 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 hover:bg-gray-200 rounded transition-colors bg-white  border-2">
                        <ArrowLeft className="w-6 h-7 text-gray-700" strokeWidth={1.5} />
                      </button>
          <div className="text-xl">
            <span className="text-gray-600">Jobs › </span>
            <span className="text-orange-600 font-semibold">{candidate.doctorName}</span>
          </div>
        </div>
        <div className="flex gap-3">
          {config.map((btn, i) => (
            <button
              key={i}
              onClick={() => handleButtonClick(btn.label, btn.action)}
              className={`text-sm font-medium ${btn.style}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8 max-w-full">
        
        {/* ===== HERO CARD ===== */}
        <CandidateHero candidate={candidate} appliedTime="Applied 2 hours Ago" />

        {/* ===== AWARDS ===== */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Awards</h2>
          <div className="grid grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 rounded p-4">
                <p className="font-semibold text-gray-900 mb-1">John McCrae Memorial Medal</p>
                <p className="text-sm text-gray-600">Jan 2025</p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== SOCIAL LINKS ===== */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Social Links</h2>
          <div className="grid grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 rounded p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm flex-shrink-0">in</div>
                <a href="#" className="text-blue-600 hover:underline text-sm break-all">https://www.linkedin.com/in</a>
              </div>
            ))}
          </div>
        </div>

        {/* ===== EXPERIENCE ===== */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Experience</h2>
            <span className="text-orange-600 text-sm font-semibold">5+ Years</span>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Image src="/svg/hospital-iconn.svg" alt="company" width={20} height={20} />
                    <div>
                      <h3 className="font-semibold text-gray-900">Medfasterrrrr</h3>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 font-medium">Assistant of audiology · Full Time</p>
                  </div>
                  <p className="text-sm text-gray-600 text-right">Jan 2025 - Present</p>
                </div>
                <p className="text-sm text-gray-700 mt-3">
                  Lorem ipsum dolor sit amet consectetur. Augue dolor enim imperdiet placerat vulputate proin leo. Lorem est nisl pulvinar libero.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== EDUCATION ===== */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Education</h2>
          <div className="grid grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 rounded p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Canadian red cross university</h3>
                    <p className="text-sm text-gray-600 mb-1">Master degree · MD</p>
                    <p className="text-xs text-gray-500">Jan 2025 - Dec 2023</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== UPLOADED DOCUMENTS ===== */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Uploaded Documents</h2>
          <div className="grid grid-cols-4 gap-6">
            {['Resume', 'License', 'Medical', 'Certificate'].map((doc, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900 text-sm">{doc}</p>
                  <a href="#" className="text-orange-600 text-xs font-semibold hover:underline">View</a>
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
        {/* ===== PERFORMANCE CARDS ===== */}
<div className="grid grid-cols-2 gap-8 mb-8">
  <div className="bg-white border border-gray-200 rounded-lg p-8">
    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
      <h3 className="text-base font-semibold text-gray-900">Conversational Round</h3>
      <ScoreBox score={80} />
    </div>
    <div className="space-y-4 mb-6">
      {[
        { label: 'live face match', value: 95 },
        { label: 'Communication skills', value: 25 },
        { label: 'Confidence', value: 82 },
        { label: 'Behavioral signals', value: 87 },
        { label: 'Accuracy of answers', value: 87 }
      ].map((m, i) => (
        <MetricRow key={i} label={m.label} value={m.value} />
      ))}
    </div>
    <div className="p-4 bg-green-50 rounded border border-green-200">
      <div className="flex gap-3">
        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-green-900 mb-1">Strengths</p>
          <p className="text-sm text-green-800">Lorem ipsum dolor sit amet consectetur.</p>
        </div>
      </div>
    </div>
  </div>

  <div className="bg-white border border-gray-200 rounded-lg p-8">
    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
      <h3 className="text-base font-semibold text-gray-900">Behavioral Round</h3>
      <ScoreBox score={40} />
    </div>
    <div className="space-y-4 mb-6">
      {[
        { label: 'live face match', value: 20 },
        { label: 'Communication skills', value: 25 },
        { label: 'Confidence', value: 32 },
        { label: 'Behavioral signals', value: 10 },
        { label: 'Accuracy of answers', value: 40 }
      ].map((m, i) => (
        <MetricRow key={i} label={m.label} value={m.value} />
      ))}
    </div>
    <div className="p-4 bg-green-50 rounded border border-green-200">
      <div className="flex gap-3">
        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-green-900 mb-1">Strengths</p>
          <p className="text-sm text-green-800">Lorem ipsum dolor sit amet consectetur.</p>
        </div>
      </div>
    </div>
  </div>
</div>

{/* ===== ANALYSIS ===== */}
<div className="grid grid-cols-2 gap-8 mb-8">
  <div className="bg-white border border-gray-200 rounded-lg p-8">
    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
      <h3 className="text-base font-semibold text-gray-900">Communication analysis</h3>
      <ScoreBox score={58} />
    </div>
    <div className="space-y-4 mb-6">
      {[
        { label: 'live face match', value: 95 },
        { label: 'Communication skills', value: 25 },
        { label: 'Confidence', value: 82 },
        { label: 'Behavioral signals', value: 87 },
        { label: 'Accuracy of answers', value: 87 }
      ].map((m, i) => (
        <MetricRow key={i} label={m.label} value={m.value} />
      ))}
    </div>
    <div className="p-4 bg-green-50 rounded border border-green-200">
      <div className="flex gap-3">
        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-green-900 mb-1">Strengths</p>
          <p className="text-sm text-green-800">Lorem ipsum dolor sit amet consectetur.</p>
        </div>
      </div>
    </div>
  </div>

  <div className="bg-white border border-gray-200 rounded-lg p-8">
    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
      <h3 className="text-base font-semibold text-gray-900">Accuracy of answers</h3>
      <ScoreBox score={88} />
    </div>
    <div className="space-y-4 mb-6">
      {[
        { label: 'live face match', value: 95 },
        { label: 'Communication skills', value: 25 },
        { label: 'Confidence', value: 82 },
        { label: 'Behavioral signals', value: 87 },
        { label: 'Accuracy of answers', value: 87 }
      ].map((m, i) => (
        <MetricRow key={i} label={m.label} value={m.value} />
      ))}
    </div>
    <div className="p-4 bg-green-50 rounded border border-green-200">
      <div className="flex gap-3">
        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-green-900 mb-1">Strengths</p>
          <p className="text-sm text-green-800">Lorem ipsum dolor sit amet consectetur.</p>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* ===== FOOTER ===== */}
        <Footer />
      </div>

      {/* Modals */}
      <ScheduleModal
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
        iconSrc="/svg/success-icon.svg"
      />
    </div>
  );
};

export default CandidateDetailPage;
