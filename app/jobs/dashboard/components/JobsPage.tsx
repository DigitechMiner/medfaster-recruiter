'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/global/navbar';
import Image from 'next/image';
import { JobListingCard, StatusSection, StatusTable } from './ui';
import CandidateDetailPage from './CandidateDetailPage';
import { Search, ArrowLeft } from 'lucide-react';
import { Job, TopJob, JobsData, StatusType } from '../types/job.types';

type LayoutMode = 'kanban' | 'table';
type ViewMode = 'dashboard' | 'allJobs' | 'candidateDetail';

const JobsPage: React.FC = () => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('kanban');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedJob, setSelectedJob] = useState<TopJob | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<{ job: Job; status: StatusType } | null>(null);

  const allTopJobListings: TopJob[] = [
    { id: 1, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
    { id: 2, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
    { id: 3, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
    { id: 4, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
    { id: 5, title: 'Job Title', experience: '3-5 yrs', position: 'Neurology Full-time', specializations: ['Neurology', 'General', 'Surgery'], postedDaysAgo: 10, applicantCount: 45 },
    { id: 6, title: 'Job Title', experience: '6-8 yrs', position: 'Surgery Part-time', specializations: ['Surgery', 'Trauma', 'General'], postedDaysAgo: 12, applicantCount: 52 },
    { id: 7, title: 'Job Title', experience: '4-6 yrs', position: 'Pediatrics Full-time', specializations: ['Pediatrics', 'General', 'Cardiology'], postedDaysAgo: 8, applicantCount: 38 },
    { id: 8, title: 'Job Title', experience: '7-9 yrs', position: 'Orthopedics Part-time', specializations: ['Orthopedics', 'Surgery', 'Trauma'], postedDaysAgo: 20, applicantCount: 67 },
    { id: 9, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
    { id: 10, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
    { id: 11, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
    { id: 12, title: 'Job Title', experience: '5-7 yrs', position: 'Cardiology Part-time', specializations: ['Cardiology', 'Orthopaedics', 'Cardiology'], postedDaysAgo: 15, applicantCount: 60 },
  ];

  const displayedTopJobs = viewMode === 'dashboard' ? allTopJobListings.slice(0, 4) : allTopJobListings;

  const jobsData: JobsData = {
    applied: [
      { id: 1, doctorName: 'Dr. Noah Liam', experience: 5, position: 'Part-Time', score: 85, specialization: ['Cardiology', 'Orthopaedics', 'Cardiology'], currentCompany: 'Canada Health' },
      { id: 2, doctorName: 'Dr. Sarah Chen', experience: 7, position: 'Full-Time', score: 92, specialization: ['Cardiology', 'Neurology', 'General'], currentCompany: 'Medical Canada' },
      { id: 3, doctorName: 'Dr. Michael Brown', experience: 6, position: 'Part-Time', score: 88, specialization: ['Cardiology', 'Orthopaedics', 'Cardiology'], currentCompany: 'Canada Health' }
    ],
    shortlisted: [
      { id: 4, doctorName: 'Dr. Noah Liam', experience: 5, position: 'Part-Time', score: 88, specialization: ['Cardiology', 'Orthopaedics', 'Cardiology'], currentCompany: 'Canada Health' },
      { id: 5, doctorName: 'Dr. Michael Smith', experience: 6, position: 'Part-Time', score: 90, specialization: ['Orthopedics', 'Surgery', 'General'], currentCompany: 'Medical Canada' },
      { id: 6, doctorName: 'Dr. Emily Davis', experience: 4, position: 'Full-Time', score: 87, specialization: ['Cardiology', 'Pediatrics', 'General'], currentCompany: 'Canada Health' }
    ],
    interviewing: [
      { id: 7, doctorName: 'Dr. Noah Liam', experience: 5, position: 'Part-Time', score: 87, specialization: ['Cardiology', 'Orthopaedics', 'Cardiology'], currentCompany: 'Canada Health' },
      { id: 8, doctorName: 'Dr. Emily Brown', experience: 4, position: 'Part-Time', score: 84, specialization: ['Pediatrics', 'General', 'Surgery'], currentCompany: 'Medical Canada' },
      { id: 9, doctorName: 'Dr. James Wilson', experience: 8, position: 'Full-Time', score: 91, specialization: ['Surgery', 'Orthopedics', 'General'], currentCompany: 'Canada Health' }
    ],
    hired: [
      { id: 10, doctorName: 'Dr. Noah Liam', experience: 5, position: 'Part-Time', score: 89, specialization: ['Cardiology', 'Orthopaedics', 'Cardiology'], currentCompany: 'Canada Health' },
      { id: 11, doctorName: 'Dr. James Wilson', experience: 8, position: 'Full-Time', score: 95, specialization: ['Surgery', 'Orthopedics', 'Trauma'], currentCompany: 'Medical Canada' },
      { id: 12, doctorName: 'Dr. Lisa Anderson', experience: 9, position: 'Part-Time', score: 93, specialization: ['Cardiology', 'Internal Medicine', 'General'], currentCompany: 'Canada Health' }
    ]
  };

  const statusSections = [
    { status: 'applied' as const, title: 'Applied', badgeColor: 'blue' as const },
    { status: 'shortlisted' as const, title: 'Shortlisted', badgeColor: 'orange' as const },
    { status: 'interviewing' as const, title: 'Interviewing', badgeColor: 'red' as const },
    { status: 'hired' as const, title: 'Hired', badgeColor: 'green' as const }
  ];

  const handleToggleLayout = () => setLayoutMode(prev => (prev === 'kanban' ? 'table' : 'kanban'));
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);
  const handleSeeAll = () => setViewMode('allJobs');
  const handleBackToDashboard = () => setViewMode('dashboard');
  const handleJobCardClick = (job: TopJob) => {
    setSelectedJob(job);
    setViewMode('candidateDetail');
  };
  const handleBackFromJobDetail = () => {
    setSelectedJob(null);
    setViewMode('allJobs');
  };
  const handleCandidateClick = (job: Job, status: StatusType) => {
    setSelectedCandidate({ job, status });
    setViewMode('candidateDetail');
  };
  const handleBackFromDetail = () => {
    setSelectedCandidate(null);
    setViewMode('dashboard');
  };

  // Candidate Detail View
  if (viewMode === 'candidateDetail' && selectedCandidate) {
    return (
      <CandidateDetailPage
        candidate={selectedCandidate.job}
        status={selectedCandidate.status}
        onBack={handleBackFromDetail}
      />
    );
  }

  // All Jobs View
  if (viewMode === 'allJobs') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleBackToDashboard} className="p-2 hover:bg-gray-100 rounded transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Jobs <span className="text-orange-500">› All Jobs</span></h1>
            </div>
            <button className="bg-orange-500 text-white px-7 py-2 rounded-lg hover:bg-orange-600 font-medium text-sm">+ Post Job</button>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
                <input type="text" placeholder="Search here..." value={searchQuery} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <button className="px-4 py-2 hover:bg-gray-100 rounded text-sm font-medium whitespace-nowrap border border-gray-300 inline-flex items-center gap-2">
                <Image src="/svg/Filter.svg" alt="filter" width={16} height={16} />Filter
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedTopJobs.map((job) => (
              <div key={job.id} onClick={() => handleJobCardClick(job)}>
                <JobListingCard job={job} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT: Dashboard View
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Jobs</h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 w-full sm:w-auto">
            <button onClick={handleSeeAll} className="text-black underline font-semibold text-sm hover:text-gray-600 transition-colors">See All</button>
            <button className="bg-orange-500 text-white px-7 py-2 rounded-lg hover:bg-orange-600 font-medium text-sm w-full sm:w-auto">+ Post Job</button>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {displayedTopJobs.map((job) => (
              <div key={job.id} onClick={() => handleJobCardClick(job)}>
                <JobListingCard job={job} />
              </div>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
              <input type="text" placeholder="Search here..." value={searchQuery} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="flex gap-2 items-center">
              <button className="px-3 py-2 hover:bg-gray-100 rounded text-sm font-medium whitespace-nowrap border border-gray-300 inline-flex items-center gap-2">
                <Image src="/svg/Filter.svg" alt="filter" width={16} height={16} />Filter
              </button>
              <div className="flex gap-2">
                <button onClick={() => setLayoutMode('kanban')} className={`px-4 py-3 inline-flex items-center gap-2 text-base font-medium transition-colors rounded-lg ${layoutMode === 'kanban' ? 'bg-gray-200 text-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  <Image src="/svg/Kanban.svg" alt="kanban" width={20} height={20} />
                </button>
                <button onClick={() => setLayoutMode('table')} className={`px-4 py-3 inline-flex items-center gap-2 text-base font-medium transition-colors rounded-lg ${layoutMode === 'table' ? 'bg-gray-200 text-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  <Image src="/svg/Table.svg" alt="table" width={20} height={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
        {layoutMode === 'kanban' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusSections.map(({ status, title, badgeColor }) => (
              <StatusSection key={status} status={status} title={title} count={jobsData[status].length} jobs={jobsData[status]} badgeColor={badgeColor} onCandidateClick={handleCandidateClick} />
            ))}
          </div>
        )}
        {layoutMode === 'table' && (
          <div className="space-y-4">
            {statusSections.map(({ status, title, badgeColor }) => (
              <StatusTable key={status} status={status} title={title} count={jobsData[status].length} jobs={jobsData[status]} badgeColor={badgeColor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
