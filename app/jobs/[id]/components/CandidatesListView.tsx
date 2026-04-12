"use client";

import React from "react";
import { Star } from "lucide-react";

const DUMMY_CANDIDATES = [
  { id: '1', name: 'Michael Liam', department: 'Nursing',    jobTitle: 'RN', skills: ['Clinical decision-making'], exp: '5 to 7 Years', rating: 4.8 },
  { id: '2', name: 'Michael Liam', department: 'Disability', jobTitle: 'RN', skills: ['Clinical decision-making'], exp: '5 to 7 Years', rating: 4.8 },
];

const HEADERS = ['Candidate Name', 'Department', 'Job Title', 'Skills', 'Experience', 'Rating', 'Actions'];

interface Props { jobId: string; }

export const CandidatesListView: React.FC<Props> = () => {
  const candidates = DUMMY_CANDIDATES;

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <p className="text-sm font-semibold text-gray-700">No Candidate Yet Accepted This Urgent Shift</p>
        <p className="text-sm text-gray-400">
          Try Our{' '}
          <span className="text-[#F4781B] font-semibold cursor-pointer">✦ KeRaeva&apos;s AI</span>
          {' '}to Invite Available Candidates For This Shift
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {HEADERS.map((h) => (
              <th key={h}
                className="text-left px-5 py-3.5 text-xs font-bold text-gray-700 bg-[#FEF3E9] whitespace-nowrap
                  first:rounded-l-xl last:rounded-r-xl">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.map((c, i) => (
            <tr key={c.id}
              className={`border-b border-gray-100 hover:bg-orange-50/30 transition-colors
                ${i === candidates.length - 1 ? 'border-b-0' : ''}`}>
              <td className="px-5 py-4 font-semibold text-gray-800">{c.name}</td>
              <td className="px-5 py-4 text-gray-600">{c.department}</td>
              <td className="px-5 py-4 text-gray-600">{c.jobTitle}</td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {c.skills.map((s) => (
                    <span key={s}
                      className="px-3 py-1 rounded-full text-xs text-gray-700 bg-white border border-gray-200">
                      {s}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{c.exp}</td>
              <td className="px-5 py-4">
                <span className="flex items-center gap-1 font-medium text-gray-700">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  {c.rating}/5
                </span>
              </td>
              <td className="px-5 py-4">
                <button className="text-green-500 underline text-sm font-semibold italic hover:underline whitespace-nowrap">
                  View Schedule
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};