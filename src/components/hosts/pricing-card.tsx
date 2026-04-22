"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Host } from "@/types";
import { formatInr } from "@/utils/currency";

type PricingCardProps = {
  host: Host;
  onSave: (payload: {
    callRatePerMinute: number;
    chatRatePerMinute: number;
    minCallBalance: number;
    minChatBalance: number;
  }) => Promise<void>;
};

export function PricingCard({ host, onSave }: PricingCardProps) {
  const [callRate, setCallRate] = useState(host.callRatePerMinute);
  const [chatRate, setChatRate] = useState(host.chatRatePerMinute);
  const [minCall, setMinCall] = useState(host.minCallBalance);
  const [minChat, setMinChat] = useState(host.minChatBalance);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        callRatePerMinute: callRate,
        chatRatePerMinute: chatRate,
        minCallBalance: minCall,
        minChatBalance: minChat,
      });
      toast.success("Pricing updated");
    } catch {
      toast.error("Failed to update pricing");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div>
        <CardTitle>Pricing & Availability</CardTitle>
        <CardDescription>
          Configure call/chat rates, minimum balance requirements, and promotional pricing
          controls for this host.
        </CardDescription>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs text-app-text-muted">Call Rate / Min</label>
          <Input
            type="number"
            value={callRate}
            onChange={(event) => setCallRate(Number(event.target.value))}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs text-app-text-muted">Chat Rate / Min</label>
          <Input
            type="number"
            value={chatRate}
            onChange={(event) => setChatRate(Number(event.target.value))}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs text-app-text-muted">
            Minimum Wallet for Call
          </label>
          <Input
            type="number"
            value={minCall}
            onChange={(event) => setMinCall(Number(event.target.value))}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs text-app-text-muted">
            Minimum Wallet for Chat
          </label>
          <Input
            type="number"
            value={minChat}
            onChange={(event) => setMinChat(Number(event.target.value))}
          />
        </div>
      </div>

      <div className="rounded-xl border border-app-border bg-black/20 p-3 text-sm text-app-text-secondary">
        Estimated 10 min call:{" "}
        <span className="font-semibold text-app-text-primary">
          {formatInr(callRate * 10)}
        </span>{" "}
        | Estimated 10 min chat:{" "}
        <span className="font-semibold text-app-text-primary">
          {formatInr(chatRate * 10)}
        </span>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          Save Pricing
        </Button>
      </div>
    </Card>
  );
}
