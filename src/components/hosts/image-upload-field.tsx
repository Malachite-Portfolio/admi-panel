"use client";

import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImageUploadFieldProps = {
  label: string;
  value?: string;
  onChange: (value?: string) => void;
};

export function ImageUploadField({ label, value, onChange }: ImageUploadFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-app-text-secondary">{label}</label>
      <div className="flex items-center gap-3">
        <div className="h-20 w-20 overflow-hidden rounded-2xl border border-app-border bg-[#130f23]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-app-text-muted">
              <ImagePlus className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  return;
                }
                const objectUrl = URL.createObjectURL(file);
                onChange(objectUrl);
              }}
            />
            <span className="inline-flex h-10 items-center rounded-xl border border-app-border px-4 text-sm text-app-text-secondary transition hover:bg-white/[0.04] hover:text-app-text-primary">
              Upload
            </span>
          </label>
          {value ? (
            <Button variant="secondary" onClick={() => onChange(undefined)}>
              <X className="h-4 w-4" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
