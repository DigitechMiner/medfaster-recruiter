'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCandidatesList } from '@/hooks/useCandidate';

export const AiMatchedCandidates = () => {
  const router = useRouter();
  const { data, isLoading } = useCandidatesList({ page: 1, limit: 4 });
  const candidates = data?.candidates ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Recent AI-Matched Candidates for Active Jobs
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-y border-gray-100">
            <tr>
              {['Candidate Name', 'Specialty', 'Location', 'Job Type', 'Score', 'Action'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : candidates.map((c) => {
              const score = c.highest_job_interview_score ?? c.highest_interview_score ?? 0;
              const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-orange-500' : 'text-red-500';
              const initials = `${c.first_name?.[0] ?? ''}${c.last_name?.[0] ?? ''}`.toUpperCase();
              const location = [c.city, c.state].filter(Boolean).join(', ') || '—';

              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-100 flex-shrink-0 flex items-center justify-center">
                        {c.profile_image_url ? (
                          <Image
                            src={c.profile_image_url}
                            alt={c.full_name}
                            width={32} height={32}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-orange-600">{initials}</span>
                        )}
                      </div>
                      <span className="font-medium text-gray-800 whitespace-nowrap">{c.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">
                    {c.specialty?.[0]?.replace(/_/g, ' ') ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{location}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">
                    {c.preferred_shift?.[0]?.replace(/_/g, ' ') ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${scoreColor}`}>
                      {score > 0 ? `${score}/100` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/candidates/${c.id}`)}
                      className="hover:text-orange-600 font-semibold text-xs text-gray-500"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
