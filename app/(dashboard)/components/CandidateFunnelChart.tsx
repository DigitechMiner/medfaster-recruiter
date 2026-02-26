"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", value: 230 },
  { day: "Tue", value: 180 },
  { day: "Web", value: 40  },
  { day: "Thu", value: 350 },
  { day: "Fri", value: 175 },
  { day: "Sat", value: 530 },
  { day: "Sun", value: 310 },
];

interface DotProps {
  cx?: number
  cy?: number
  value?: number
  index?: number
  payload?: { day: string } // ← was missing, causes "payload" error
}

const CustomDot = (props: DotProps) => {
  const { cx, cy, payload } = props
  if (payload?.day !== "Thu") return null  // ← optional chain since payload is optional
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill="white"
      stroke="#f97316"
      strokeWidth={2}
    />
  )
}

interface TooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

// Custom tooltip — orange pill
const CustomTooltip = ({ active, payload, }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md">
        {payload[0].value}
      </div>
    );
  }
  return null;
};

export const CandidateFunnelChart = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <h2 className="text-base font-semibold text-gray-900 mb-4">New Candidate Funnel</h2>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="funnelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f97316" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#f97316" stopOpacity={0}    />
          </linearGradient>
        </defs>

        {/* Light horizontal grid lines only */}
        <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="" />

        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#9ca3af" }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          ticks={[0, 100, 200, 300, 400, 500]}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={false}
        />

        <Area
          type="monotone"
          dataKey="value"
          stroke="#f97316"
          strokeWidth={2}
          fill="url(#funnelGrad)"
          dot={<CustomDot />}
          activeDot={false} // disable recharts default active dot
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
