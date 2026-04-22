"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import type { TopEarningHost } from "@/types";

export function TopHostsBarChart({ data }: { data: TopEarningHost[] }) {
  return (
    <Card className="h-[320px] p-4">
      <CardTitle className="mb-4 text-base">Top Earning Hosts</CardTitle>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="hostName" stroke="#8d86a8" />
          <YAxis stroke="#8d86a8" />
          <Tooltip
            contentStyle={{
              background: "#130f23",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
            }}
          />
          <Bar dataKey="amount" fill="#ff2ea6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
