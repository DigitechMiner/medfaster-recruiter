import React from 'react';
import Image from 'next/image';

// MetricRow Component
export const MetricRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <div className="flex justify-between mb-1.5 text-sm">
      <span className="text-gray-700">{label}</span>
      <span className="font-semibold text-gray-900">{value}%</span>
    </div>
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-green-500" style={{ width: `${value}%` }} />
    </div>
  </div>
);

// PerformanceCard Component
export const PerformanceCard: React.FC<{
  title: string;
  score: number;
  borderColor: string;
  textColor: string;
  metrics: { label: string; value: number }[];
  showStrengths?: boolean;
}> = ({ title, score, borderColor, textColor, metrics, showStrengths = true }) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div className="p-8 border-b border-gray-200 flex items-center justify-between">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <div className={`flex items-center justify-center w-20 h-20 border-2 rounded-full ${borderColor}`}>
        <div className="text-center">
          <div className={`text-xl font-bold ${textColor}`}>{score}</div>
          <div className={`text-xs font-semibold ${textColor}`}>/100 Score</div>
        </div>
      </div>
    </div>
    <div className="p-8">
      <div className="space-y-4 mb-6">
        {metrics.map((m, i) => (
          <MetricRow key={i} label={m.label} value={m.value} />
        ))}
      </div>
      {showStrengths && (
        <div className="p-4 bg-green-50 rounded border border-green-200">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">Strengths</p>
              <p className="text-sm text-green-800">Lorem ipsum dolor sit amet consectetur. Velit id sollicitudin eget venenatis enim.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

// InfoCard Component
export const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-8">
    <h2 className="text-lg font-semibold text-gray-900 mb-6">{title}</h2>
    {children}
  </div>
);

// ScoreCircle Component (for performance metrics header)
export const ScoreCircle: React.FC<{ score: number; borderColor: string; textColor: string }> = ({ score, borderColor, textColor }) => (
  <div className={`flex items-center justify-center w-20 h-20 border-2 rounded-full ${borderColor}`}>
    <div className="text-center">
      <div className={`text-xl font-bold ${textColor}`}>{score}</div>
      <div className={`text-xs font-semibold ${textColor}`}>/100 Score</div>
    </div>
  </div>
);
