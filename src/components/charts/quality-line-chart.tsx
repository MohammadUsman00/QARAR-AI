"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function QualityLineChart({
  data,
}: {
  data: { month: string; score: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,169,81,0.12)" />
          <XAxis dataKey="month" tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} />
          <YAxis domain={[0, 10]} tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              color: "var(--text-primary)",
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--accent-primary)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
