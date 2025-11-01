'use client';

import React from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/global/navbar';
import { ScoreBox } from './ui';
import { PerformanceCard, MetricRow } from './CandidateDetailComponents';
import { Job, StatusType } from '../types/job.types';
import { ArrowLeft } from 'lucide-react';

interface CandidateDetailPageProps {
  candidate: Job;
  status: StatusType;
  onBack: () => void;
}

export const CandidateDetailPage: React.FC<CandidateDetailPageProps> = ({ candidate, status, onBack }) => {
  const buttonConfigs = {
    applied: [
      { label: 'Reject', style: 'border-2 border-red-500 text-red-500 px-6 py-2 hover:bg-red-50 rounded' },
      { label: 'Schedule', style: 'border border-gray-300 text-gray-700 px-6 py-2 hover:bg-gray-50 rounded bg-white' },
      { label: 'Hire', style: 'bg-orange-500 text-white px-6 py-2 hover:bg-orange-600 rounded' }
    ],
    shortlisted: [
      { label: 'Reject', style: 'border-2 border-red-500 text-red-500 px-6 py-2 hover:bg-red-50 rounded' },
      { label: 'Schedule', style: 'border border-gray-300 text-gray-700 px-6 py-2 hover:bg-gray-50 rounded bg-white' },
      { label: 'Hire', style: 'bg-orange-500 text-white px-6 py-2 hover:bg-orange-600 rounded' }
    ],
    interviewing: [
      { label: 'Reject', style: 'border-2 border-red-500 text-red-500 px-6 py-2 hover:bg-red-50 rounded' },
      { label: 'Schedule', style: 'border border-gray-300 text-gray-700 px-6 py-2 hover:bg-gray-50 rounded bg-white' },
      { label: 'Hire', style: 'bg-orange-500 text-white px-6 py-2 hover:bg-orange-600 rounded' }
    ],
    hired: [
      { label: 'View Offer', style: 'border border-gray-300 text-gray-700 px-6 py-2 hover:bg-gray-50 rounded bg-white' },
      { label: 'Generate Offer', style: 'bg-green-500 text-white px-6 py-2 hover:bg-green-600 rounded' }
    ]
  };

  const config = buttonConfigs[status];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="px-8 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-sm">
            <span className="text-gray-600">Jobs › </span>
            <span className="text-orange-600 font-semibold">{candidate.doctorName}</span>
          </div>
        </div>
        <div className="flex gap-3">
          {config.map((btn, i) => (
            <button key={i} className={`text-sm font-medium ${btn.style}`}>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8 max-w-full">
        
        {/* ===== HERO CARD ===== */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          {/* Top Section */}
          <div className="flex gap-6 mb-8">
            <div className="w-28 h-28 rounded-lg bg-gray-300 flex-shrink-0" />
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{candidate.doctorName}</h1>
                <span className="text-orange-600 text-sm font-semibold">Applied 2 hours Ago</span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <span>Toronto, Canada</span>
                <span>noahliamdoc@gmail.com</span>
                <span>+1 123 1231 213</span>
                <span className="text-orange-600 font-medium cursor-pointer hover:underline">Chat</span>
              </div>
              
              <p className="text-gray-600">Part Time</p>
            </div>
          </div>

          {/* 4 Column Grid - Single Row with SVGs */}
          <div className="flex gap-8 border-t border-gray-200 pt-8">
            <div className="flex-1 border-r border-gray-200 pr-8">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 6h-2.15a2.01 2.01 0 0 0-3.97 0h-2.68a2.01 2.01 0 0 0-3.97 0H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
                </svg>
                <span className="text-xs text-gray-600">Total work experience</span>
              </div>
              <p className="text-lg font-bold text-gray-900">5+ Years</p>
            </div>

            <div className="flex-1 border-r border-gray-200 pr-8">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                <span className="text-xs text-gray-600">Current Role</span>
              </div>
              <p className="text-lg font-bold text-gray-900">Assistant of audiology</p>
            </div>

            <div className="flex-1 border-r border-gray-200 pr-8">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                </svg>
                <span className="text-xs text-gray-600">Current Company</span>
              </div>
              <p className="text-lg font-bold text-gray-900">Medfasterrrrr</p>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/>
                </svg>
                <span className="text-xs text-gray-600">Preferred Location</span>
              </div>
              <p className="text-lg font-bold text-gray-900">Toronto, Canada</p>
            </div>
          </div>

          {/* Tags Section - Content inline with headers */}
          <div className="mt-8 pt-8 border-t border-gray-200 space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-orange-600 min-w-fit">Specialization :</p>
              <div className="flex flex-wrap gap-2">
                {candidate.specialization.map((spec, i) => (
                  <span key={i} className="px-2 py-1 text-gray-700 rounded text-xs">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-orange-600 min-w-fit">Qualification :</p>
              <div className="flex flex-wrap gap-2">
                {candidate.specialization.map((qual, i) => (
                  <span key={i} className="px-2 py-1 text-gray-700 rounded text-xs">
                    {qual}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-orange-600 min-w-fit">Work Eligibility :</p>
              <span className="px-2 py-1 text-gray-700 rounded text-xs">
                Canadian Citizen
              </span>
            </div>

            {/* Skill with top border separator */}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-orange-600 min-w-fit">Skill :</p>
                <div className="flex flex-wrap gap-2">
                  {['Cardiology', 'Orthopedics', 'Dermatology', 'Orthopedics', 'Oncology', 'Dermatology', 'Orthopedics', 'Oncology', 'Neurology'].map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Hobby with top border separator */}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-orange-600 min-w-fit">Hobby :</p>
                <div className="flex flex-wrap gap-2">
                  {['Hiking', 'Cycling', 'Gardening', 'Photography', 'Volunteering'].map((hobby, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

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

       {/* ===== EXPERIENCE - HORIZONTAL LAYOUT ===== */}
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
          Lorem ipsum dolor sit amet consectetur. Augue dolor enim imperdiet placerat vulputate proin leo. Lorem est nisl pulvinar libero. Quam elementum neque amet odio. In est sit varius cursus vitae velit nec. Pellentesque egestas eu sit accumsan lectus.
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

        {/* ===== UPLOADED DOCUMENTS - View/Read on Top ===== */}
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

        {/* ===== PERFORMANCE CARDS WITH SCOREBOX ===== */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Conversational Round */}
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

          {/* Behavioral Round */}
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
          {/* Communication Analysis */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Communication analysis</h3>
              <ScoreBox score={58} />
            </div>
            <div className="space-y-4">
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
          </div>

          {/* Accuracy of Answers */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Accuracy of answers</h3>
              <ScoreBox score={88} />
            </div>
            <div className="space-y-4">
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
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="text-center text-xs text-gray-600 py-8">
          <p className="mb-4">All © copyright reserved by Medfasterrrrr</p>
          <div className="flex items-center justify-center gap-8">
            <a href="#" className="text-orange-600 hover:underline font-medium">Terms & Conditions</a>
            <a href="#" className="text-orange-600 hover:underline font-medium">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailPage;
