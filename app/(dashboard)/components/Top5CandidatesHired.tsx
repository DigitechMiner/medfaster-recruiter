'use client';
import { useCandidatesList } from '@/hooks/useRecruiterData';
import type { CandidateListItem } from '@/Interface/recruiter.types';

export const Top5CandidatesHired = () => {
  const { data, isLoading } = useCandidatesList({ status: 'hired', limit: 5 });
  const candidates = data?.data?.candidates ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Top 5 Candidates Hired by you</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Rank', 'Candidates', 'Jobs', 'Hired', 'Avg. Time'].map((h, i) => (
                <th key={h} className={`px-4 py-2.5 text-xs font-medium text-gray-400 ${i > 1 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : candidates.length === 0 ? (
              [
                { rank: '1st', name: 'Sarah Jenkins', jobs: 12, hired: 8,  time: '2 hrs' },
                { rank: '2nd', name: 'Michael Lee',   jobs: 8,  hired: 5,  time: '5 hrs' },
                { rank: '3rd', name: 'Priya Sharma',  jobs: 15, hired: 3,  time: '12 hrs' },
                { rank: '4th', name: 'John Doe',      jobs: 4,  hired: 1,  time: '24 hrs' },
                { rank: '5th', name: 'David Chen',    jobs: 6,  hired: 4,  time: '3 hrs' },
              ].map((r) => (
                <tr key={r.rank} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-600">{r.rank}</td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-800">{r.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 text-right">{String(r.jobs).padStart(2,'0')}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 text-right">{String(r.hired).padStart(2,'0')}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 text-right">{r.time}</td>
                </tr>
              ))
            ) : candidates.map((c: CandidateListItem, i: number) => (
              <tr key={c.id ?? i} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-600">{['1st','2nd','3rd','4th','5th'][i]}</td>
                <td className="px-4 py-3 text-xs font-medium text-gray-800">{c.full_name ?? `${c.first_name} ${c.last_name ?? ''}`.trim()}</td>
                <td className="px-4 py-3 text-xs text-gray-600 text-right">—</td>
                <td className="px-4 py-3 text-xs text-gray-600 text-right">—</td>
                <td className="px-4 py-3 text-xs text-gray-600 text-right">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};