'use client';

import React from 'react';
import Image from 'next/image';
import { Job, StatusType } from '../types/job.types';

interface CandidateHeroSectionProps {
  candidate: Job;
  status: StatusType;
  onBack: () => void;
}

export const CandidateHeroSection: React.FC<CandidateHeroSectionProps> = ({ candidate, status, onBack }) => {
  const buttonConfigs = {
    applied: [
      { label: 'Reject', style: 'border-2 border-red-500 text-red-500 hover:bg-red-50' },
      { label: 'Schedule', style: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
      { label: 'Shortlist', style: 'bg-orange-500 text-white hover:bg-orange-600' }
    ],
    shortlisted: [
      { label: 'Reject', style: 'border-2 border-red-500 text-red-500 hover:bg-red-50' },
      { label: 'Schedule', style: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
      { label: 'Move to Interview', style: 'bg-orange-500 text-white hover:bg-orange-600' }
    ],
    interviewing: [
      { label: 'Reject', style: 'border-2 border-red-500 text-red-500 hover:bg-red-50' },
      { label: 'Reschedule', style: 'bg-red-100 text-red-700 hover:bg-red-200' },
      { label: 'Hire', style: 'bg-green-500 text-white hover:bg-green-600' }
    ],
    hired: [
      { label: 'View Offer', style: 'bg-green-100 text-green-700 hover:bg-green-200' },
      { label: 'Generate Offer', style: 'bg-green-500 text-white hover:bg-green-600' }
    ]
  };

  const config = buttonConfigs[status];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start justify-between mb-6">
          <button onClick={onBack} className="text-orange-500 text-sm font-semibold hover:underline">
            ← Back
          </button>
          <div className="flex gap-2">
            {config.map((btn, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${btn.style}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{candidate.doctorName}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                status === 'applied' ? 'bg-blue-100 text-blue-700' :
                status === 'shortlisted' ? 'bg-orange-100 text-orange-700' :
                status === 'interviewing' ? 'bg-red-100 text-red-700' :
                'bg-green-100 text-green-700'
              }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{candidate.experience}+ years | {candidate.position}</p>
            
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Current Company</p>
                <p className="text-sm font-semibold text-gray-900">{candidate.currentCompany ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Score</p>
                <p className="text-sm font-semibold text-green-700">{candidate.score}/100</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-semibold text-gray-900">Toronto, Canada</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Applied Date</p>
                <p className="text-sm font-semibold text-gray-900">Nov 01, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
