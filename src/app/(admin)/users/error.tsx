"use client";

import { useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function UsersErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin-users] page error", error);
  }, [error]);

  return (
    <AdminLayout
      title="User Management"
      subtitle="Inspect users, manage account state, and perform wallet adjustments."
    >
      <Card className="space-y-4 p-4">
        <EmptyState
          title="Unable to load users"
          description="This page couldn’t load right now. Please retry."
        />
        <div className="flex items-center justify-center">
          <Button onClick={reset}>Retry</Button>
        </div>
        {process.env.NODE_ENV !== "production" ? (
          <p className="text-center text-xs text-app-text-muted">
            Diagnostic: {error.message || "Unknown users page failure"}
          </p>
        ) : null}
      </Card>
    </AdminLayout>
  );
}
