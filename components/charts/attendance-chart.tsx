"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface AttendanceChartProps {
  data: {
    date: string;
    present: number;
    absent: number;
  }[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
          }}
          itemStyle={{ color: "var(--foreground)" }}
        />
        <Line
          type="monotone"
          dataKey="present"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="absent"
          stroke="hsl(var(--destructive))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
