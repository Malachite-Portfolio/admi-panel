"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import type { RevenuePoint } from "@/types";

export function RevenueLineChart({ data }: { data: RevenuePoint[] }) {
  return (
    <Card className="h-[320px] p-4">
      <CardTitle className="mb-4 text-base">Revenue & Recharge Trend</CardTitle>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="label" stroke="#8d86a8" />
          <YAxis stroke="#8d86a8" />
          <Tooltip
            contentStyle={{
              background: "#130f23",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#ff2ea6"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="recharge"
            stroke="#b042ff"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
