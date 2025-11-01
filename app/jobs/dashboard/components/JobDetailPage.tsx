'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/global/navbar';
import { JobActionModal } from './ui';
import { ArrowLeft } from 'lucide-react';
import { TopJob } from '../types/job.types';
import { Button } from '@/components/ui/button';
import { JobBasicInfo } from '../../create/components/job-basic-info';
import { JobRequirements } from '../../create/components/job-requirements';
import { JobInterviewSettings } from '../../create/components/job-interview-settings';
import { JobDescription } from '../../create/components/job-description';
import { QuestionsTopic } from '../../create/components/questions-topic';
import SuccessModal from '../../create/components/job-success-modal';

interface Question {
  id: string;
  text: string;
}

interface Topic {
  id: string;
  title: string;
  questions: Question[];
}

interface JobDetailPageProps {
  job: TopJob;
  onBack: () => void;
}

const JobDetailPage: React.FC<JobDetailPageProps> = ({ job, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: 'Nurse',
    department: 'Cardiology',
    jobType: 'Part Time',
    location: 'Toronto, ON',
    payRange: [2300, 2800] as [number, number],
    experience: '2-3 Yrs',
    qualification: ['Cardiology', 'Orthopedics', 'Neurology'],
    specialization: ['Cardiology', 'Orthopedics', 'Neurology'],
    urgency: 'High',
    inPersonInterview: 'Yes',
    physicalInterview: 'Yes',
    description: 'Lorem ipsum dolor sit amet consectetur. Ornare in neque varius neque. Donec quam aliquam donec morbi vel vulputate tristique quis semper.',
  });

  const [topics, setTopics] = useState<Topic[]>([
    {
      id: '1',
      title: 'Questions Topic 1',
      questions: [
        { id: '1-1', text: 'Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?' },
        { id: '1-2', text: 'Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?' },
        { id: '1-3', text: 'Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?' },
        { id: '1-4', text: 'Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?' },
      ],
    },
    {
      id: '2',
      title: 'Questions Topic 2',
      questions: [
        { id: '2-1', text: 'Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?' },
        { id: '2-2', text: 'Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?' },
        { id: '2-3', text: 'Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?' },
      ],
    },
    {
      id: '3',
      title: 'Questions Topic 3',
      questions: [
        { id: '3-1', text: 'Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?' },
        { id: '3-2', text: 'Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?' },
        { id: '3-3', text: 'Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?' },
        { id: '3-4', text: 'Lorem ipsum dolor sit amet consectetuer Non commodo tellus non enim sit?' },
      ],
    },
    {
      id: '4',
      title: 'Questions Topic 4',
      questions: [
        { id: '4-1', text: 'Lorem ipsum dolor sit amet consectetuer Non commodo' },
        { id: '4-2', text: 'Lorem ipsum dolor sit amet consectetuer Non commodo' },
      ],
    },
  ]);

  const updateFormData: any = (updates: any) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const addQuestion = (topicId: string) => {
    setTopics((prevTopics) =>
      prevTopics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              questions: [
                ...topic.questions,
                {
                  id: `${topicId}-${topic.questions.length + 1}`,
                  text: '',
                },
              ],
            }
          : topic
      )
    );
  };

  const removeQuestion = (topicId: string, questionId: string) => {
    setTopics((prevTopics) =>
      prevTopics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              questions: topic.questions.filter((q) => q.id !== questionId),
            }
          : topic
      )
    );
  };

  const updateQuestion = (topicId: string, questionId: string, text: string) => {
    setTopics((prevTopics) =>
      prevTopics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              questions: topic.questions.map((q) =>
                q.id === questionId ? { ...q, text } : q
              ),
            }
          : topic
      )
    );
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCloseJobClick = () => {
    setShowCloseModal(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setIsEditing(false);
  };

  const confirmIcon = (
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
      <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    </div>
  );

  // Show Edit Form
  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Job post</h1>
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={handleEditCancel} className="flex-1 sm:flex-none px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white font-medium text-sm rounded">Preview</button>
              <button onClick={() => { console.log('Save all:', formData, topics); setShowSuccessModal(true); }} className="flex-1 sm:flex-none px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm rounded">Save & continue</button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6 sm:mb-8">Edit job details</h2>
              <div className="space-y-8">
                <JobBasicInfo formData={formData} updateFormData={updateFormData} />
                <JobRequirements formData={formData} updateFormData={updateFormData} />
                <JobInterviewSettings formData={formData} updateFormData={updateFormData} />
                <JobDescription formData={formData} updateFormData={updateFormData} />
                <hr className="my-8" />
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6">Interview Questions</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    {topics.map((topic) => (
                      <QuestionsTopic
                        key={topic.id}
                        topic={topic}
                        onAddQuestion={() => addQuestion(topic.id)}
                        onRemoveQuestion={(questionId) => removeQuestion(topic.id, questionId)}
                        onUpdateQuestion={(questionId, text) => updateQuestion(topic.id, questionId, text)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-stretch sm:items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200">
              <Button type="button" onClick={handleEditCancel} className="w-full sm:w-auto bg-white border-[#D9D9E0] border-2 hover:bg-gray-50 text-gray-600 px-4 sm:px-6 h-10 text-sm order-2 sm:order-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button type="button" onClick={() => { console.log('Save all:', formData, topics); setShowSuccessModal(true); }} className="w-full sm:w-auto bg-[#F4781B] hover:bg-orange-600 text-white px-4 sm:px-6 h-10 shadow-sm text-sm order-1 sm:order-2">Save</Button>
            </div>
          </div>
        </div>
        <SuccessModal visible={showSuccessModal} onClose={handleSuccessClose} title="Job updated successfully" message="Your job post has been updated." buttonText="Done" />
      </div>
    );
  }

  // Show Job Detail
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-8 py-3 bg-gray-50 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 hover:bg-gray-200 rounded transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Jobs</span>
              <span className="text-gray-400">›</span>
              <span className="text-orange-500 font-semibold">Nurse</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCloseJobClick} className="px-3 py-1.5 border-2 border-red-500 text-red-500 rounded font-medium text-xs sm:text-sm hover:bg-red-50 transition-colors whitespace-nowrap">Close This Job</button>
            <button onClick={handleEditClick} className="px-4 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap">Edit Job</button>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-2 text-right border-b border-gray-200">
        <p className="text-xs text-gray-600">{job.applicantCount} applied</p>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start gap-4 mb-6">
          <Image src="/svg/hospital-iconn.svg" alt="hospital" width={56} height={56} className="rounded-full flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
              <Image src="/svg/time-ago.svg" alt="time" width={12} height={12} />
              {job.postedDaysAgo} min ago
            </p>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5">Job Title : Nurse</h1>
            <p className="text-xs sm:text-sm text-gray-600">Narayana Hospital</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 mb-6 pb-6 border-b border-gray-200">
          <div className="pr-4 border-r border-gray-200 sm:border-r">
            <div className="flex flex-col items-start gap-2">
              <Image src="/svg/Location.svg" alt="location" width={20} height={20} />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-semibold text-gray-900">Toronto, ON</p>
              </div>
            </div>
          </div>
          <div className="px-4 border-r border-gray-200 sm:border-r">
            <div className="flex flex-col items-start gap-2 mb-2">
              <Image src="/svg/briefcasee.svg" alt="experience" width={20} height={20} />
            </div>
            <p className="text-xs text-gray-500 mb-1">Experience Required</p>
            <p className="text-sm font-semibold text-gray-900">2-3+ Years</p>
          </div>
          <div className="px-4 border-r border-gray-200 sm:border-r">
            <div className="flex flex-col items-start gap-2 mb-2">
              <Image src="/svg/stopwatch.svg" alt="job-type" width={20} height={20} />
            </div>
            <p className="text-xs text-gray-500 mb-1">Job Type</p>
            <p className="text-sm font-semibold text-gray-900">Full Time</p>
          </div>
          <div className="pl-4">
            <div className="flex flex-col items-start gap-2 mb-2">
              <Image src="/svg/money.svg" alt="salary" width={20} height={20} />
            </div>
            <p className="text-xs text-gray-500 mb-1">Salaries</p>
            <p className="text-sm font-semibold text-gray-900">$12k - $15k</p>
          </div>
        </div>
        <div className="mb-5 pb-5 border-b border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <Image src="/svg/message.svg" alt="email" width={16} height={16} />
            <span className="text-xs sm:text-sm text-gray-700">narayanehealth@gmail.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/svg/Phone.svg" alt="phone" width={16} height={16} />
            <span className="text-xs sm:text-sm text-gray-700">+022 7647 7363</span>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/svg/Internet.svg" alt="website" width={16} height={16} />
            <span className="text-xs sm:text-sm text-gray-700">www.narayanehealth.com</span>
          </div>
        </div>
        <div className="mb-5 pb-5 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Description :</h3>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            Lorem ipsum dolor sit amet consectetur. Fusce volutpat nec placerat faucibus in tellus et mattis. Dooer elementum quis aliquam neque. Elementum maecenas vitae locus laoreet eu. Aliquam egestas vel diam etiam purus. Imperdiet commodo pellentesque neque nontius placerat fringilla sapien ac nulla. Quis scelerisque metus etiam tortor. Feugiat arcu vitae ultaricomplor mincius vesibuium interdum. Neque felis ultricies ut dolor faucibus.
          </p>
        </div>
        <div className="mb-5 pb-5 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-orange-600 mb-3">Specialization :</h3>
          <div className="flex flex-wrap gap-2">
            {['Cardiology', 'Cardiology', 'Orthopaedics', 'Cardiology', 'Orthopaedics', 'Neurology'].map((spec, idx) => (
              <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">{spec}</span>
            ))}
          </div>
        </div>
        <div className="mb-5 pb-5 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-orange-600 mb-3">Qualification :</h3>
          <div className="flex flex-wrap gap-2">
            {['Cardiology', 'Cardiology', 'Orthopaedics', 'Cardiology', 'Orthopaedics', 'Neurology'].map((qual, idx) => (
              <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">{qual}</span>
            ))}
          </div>
        </div>
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-orange-600 mb-4">Interview Questions :</h3>
          <div className="space-y-4">
            {['Questions Topic 1', 'Questions Topic 2', 'Questions Topic 3', 'Questions Topic 4'].map((topic, topicIdx) => (
              <div key={topicIdx}>
                <p className="text-sm font-semibold text-gray-900 mb-2">{topic}</p>
                <ol className="space-y-1 ml-4">
                  {[1, 2, 3, 4].map((qIdx) => (
                    <li key={qIdx} className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      <span className="font-semibold">{qIdx}.</span> Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-gray-500">All © copyright reserved by MedFasterrrr</p>
            <div className="flex gap-6">
              <a href="#" className="text-orange-500 text-xs hover:underline font-medium">Terms & Conditions</a>
              <a href="#" className="text-orange-500 text-xs hover:underline font-medium">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
      <JobActionModal isOpen={showCloseModal} onClose={() => setShowCloseModal(false)} type="confirm" title="Are you sure want to close this job?" message="" svgIcon={confirmIcon} primaryButtonText="Yes" secondaryButtonText="No" primaryButtonColor="red" onPrimaryClick={() => setShowCloseModal(false)} onSecondaryClick={() => setShowCloseModal(false)} />
      <SuccessModal visible={showSuccessModal} onClose={handleSuccessClose} title="Job updated successfully" message="Your job post has been updated." buttonText="Done" />
    </div>
  );
};

export default JobDetailPage;
