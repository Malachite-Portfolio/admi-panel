"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { SessionTable } from "@/components/ui/session-table";
import { Tabs } from "@/components/ui/tabs";
import { useForceEndSession, useLiveSessions } from "@/features/sessions/use-sessions";
import type { LiveSession } from "@/types";

type SessionFilter = "all" | "call" | "chat";

export default function SessionsPage() {
  const liveSessionsQuery = useLiveSessions();
  const forceEnd = useForceEndSession();
  const [selected, setSelected] = useState<LiveSession | null>(null);
  const [filter, setFilter] = useState<SessionFilter>("all");

  const sessions = (liveSessionsQuery.data ?? []).filter((session) =>
    filter === "all" ? true : session.type === filter,
  );

  return (
    <AdminLayout
      title="Live Sessions Control"
      subtitle="Monitor active calls/chats and intervene with force-end when required."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={filter}
          onChange={(value) => setFilter(value as SessionFilter)}
          items={[
            { label: "All Live", value: "all" },
            { label: "Calls", value: "call" },
            { label: "Chats", value: "chat" },
          ]}
        />
      </div>

      {liveSessionsQuery.isError ? (
        <EmptyState
          title="Unable to load live sessions"
          description="Session data could not be fetched from the backend."
        />
      ) : null}

      <SessionTable
        sessions={sessions}
        loading={liveSessionsQuery.isLoading}
        emptyLabel={
          liveSessionsQuery.isError
            ? "Unable to load live sessions."
            : "No live sessions found."
        }
      />

      <div className="glass-card rounded-2xl border border-app-border p-4">
        <p className="mb-2 text-sm text-app-text-secondary">Quick Intervention</p>
        <div className="flex flex-wrap gap-2">
          {sessions.slice(0, 6).map((session) => (
            <Button
              key={session.id}
              variant="secondary"
              size="sm"
              onClick={() => setSelected(session)}
            >
              End {session.type} • {session.userName}
            </Button>
          ))}
        </div>
      </div>

      <ConfirmationModal
        open={Boolean(selected)}
        title="Force End Session"
        description={
          selected
            ? `Force end ${selected.type} between ${selected.userName} and ${selected.hostName}?`
            : "Force end this session?"
        }
        confirmLabel="Force End"
        isLoading={forceEnd.isPending}
        onCancel={() => setSelected(null)}
        onConfirm={() => {
          if (!selected) {
            return;
          }
          forceEnd.mutate({ sessionId: selected.id, reason: "force_ended_by_admin" });
          setSelected(null);
        }}
      />
    </AdminLayout>
  );
}
