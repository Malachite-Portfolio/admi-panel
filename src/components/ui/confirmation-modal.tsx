"use client";

import { AlertTriangle, X } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ConfirmationModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  disableConfirm?: boolean;
  children?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading,
  disableConfirm,
  children,
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="glass-card w-full max-w-md rounded-2xl border border-app-border p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-app-accent-bg p-2">
              <AlertTriangle className="h-4 w-4 text-app-accent" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-app-text-primary">{title}</h4>
              <p className="mt-1 text-sm text-app-text-secondary">{description}</p>
            </div>
          </div>
          <button
            className="rounded-full p-1 text-app-text-muted transition hover:bg-white/10 hover:text-app-text-primary"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children ? <div className="mb-4">{children}</div> : null}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading || disableConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
