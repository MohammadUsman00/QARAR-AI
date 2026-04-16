"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export function DomainRadarChart({
  data,
}: {
  data: { domain: string; score: number }[];
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="rgba(200,169,81,0.15)" />
          <PolarAngleAxis
            dataKey="domain"
            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="var(--accent-neural)"
            fill="var(--accent-neural)"
            fillOpacity={0.25}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              color: "var(--text-primary)",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
