"use client";

import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  hostFormSchema,
  type HostFormInputValues,
  type HostFormValues,
} from "@/features/hosts/host-schema";
import { ImageUploadField } from "@/components/hosts/image-upload-field";
import type { Host } from "@/types";

type HostFormProps = {
  defaultValues?: Partial<Host>;
  isSubmitting?: boolean;
  onSubmit: (values: HostFormValues, mode: "draft" | "create" | "verify") => void;
};

export function HostForm({ defaultValues, isSubmitting, onSubmit }: HostFormProps) {
  const defaults = useMemo<HostFormInputValues>(
    () => ({
      fullName: defaultValues?.fullName ?? "",
      displayName: defaultValues?.displayName ?? "",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
      password: "",
      gender: defaultValues?.gender ?? "female",
      age: defaultValues?.age ?? 25,
      bio: defaultValues?.bio ?? "",
      quote: defaultValues?.quote ?? "",
      category: defaultValues?.category ?? "",
      languages: defaultValues?.languages?.join(", ") ?? "",
      specializationTags: defaultValues?.skills?.join(", ") ?? "",
      experienceYears: defaultValues?.experienceYears ?? 1,
      education: "",
      skills: defaultValues?.skills?.join(", ") ?? "",
      callRatePerMinute: defaultValues?.callRatePerMinute ?? 15,
      chatRatePerMinute: defaultValues?.chatRatePerMinute ?? 12,
      minChatBalance: defaultValues?.minChatBalance ?? 20,
      minCallBalance: defaultValues?.minCallBalance ?? 30,
      availabilitySchedule: defaultValues?.availabilitySchedule ?? "10:00 AM - 10:00 PM",
      verificationStatus: defaultValues?.verificationStatus ?? "pending",
      active: defaultValues ? defaultValues.status === "active" : true,
      visibleInApp: defaultValues ? defaultValues.visibility === "visible" : true,
      featured: defaultValues?.featured ?? false,
      commissionPercent: defaultValues?.platformCommission ?? 20,
      priorityRank: 1,
      profileImageUrl: defaultValues?.profileImageUrl,
      coverImageUrl: defaultValues?.coverImageUrl,
    }),
    [defaultValues],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<HostFormInputValues, unknown, HostFormValues>({
    resolver: zodResolver(hostFormSchema),
    defaultValues: defaults,
  });

  const active = useWatch({ control, name: "active" });
  const visibleInApp = useWatch({ control, name: "visibleInApp" });
  const featured = useWatch({ control, name: "featured" });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((values) => onSubmit(values, "create"))}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Full Name</label>
          <Input {...register("fullName")} />
          {errors.fullName ? (
            <p className="mt-1 text-xs text-app-danger">{errors.fullName.message}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Display Name</label>
          <Input {...register("displayName")} />
          {errors.displayName ? (
            <p className="mt-1 text-xs text-app-danger">{errors.displayName.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Phone</label>
          <Input {...register("phone")} />
          {errors.phone ? (
            <p className="mt-1 text-xs text-app-danger">{errors.phone.message}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Email</label>
          <Input {...register("email")} />
          {errors.email ? (
            <p className="mt-1 text-xs text-app-danger">{errors.email.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Temp Password</label>
          <Input type="password" {...register("password")} />
        </div>
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Gender</label>
          <Select
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
            {...register("gender")}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Age</label>
          <Input type="number" {...register("age")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Category</label>
          <Input placeholder="Relationship, Anxiety, Career..." {...register("category")} />
        </div>
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Languages</label>
          <Input placeholder="Hindi, English" {...register("languages")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Skills</label>
          <Input placeholder="Empathy, Active Listening" {...register("skills")} />
        </div>
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">
            Specialization Tags
          </label>
          <Input placeholder="Stress Relief, Couple Counselling" {...register("specializationTags")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">
            Experience (Years)
          </label>
          <Input type="number" {...register("experienceYears")} />
        </div>
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Call Price / Min</label>
          <Input type="number" {...register("callRatePerMinute")} />
        </div>
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Chat Price / Min</label>
          <Input type="number" {...register("chatRatePerMinute")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">
            Minimum Chat Balance
          </label>
          <Input type="number" {...register("minChatBalance")} />
        </div>
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">
            Minimum Call Balance
          </label>
          <Input type="number" {...register("minCallBalance")} />
        </div>
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Commission %</label>
          <Input type="number" {...register("commissionPercent")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Tagline / Quote</label>
          <Input {...register("quote")} />
        </div>
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Availability</label>
          <Input {...register("availabilitySchedule")} />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-app-text-secondary">Bio</label>
        <Textarea {...register("bio")} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="profileImageUrl"
          render={({ field }) => (
            <ImageUploadField
              label="Profile Image"
              value={field.value}
              onChange={(value) => setValue("profileImageUrl", value)}
            />
          )}
        />
        <Controller
          control={control}
          name="coverImageUrl"
          render={({ field }) => (
            <ImageUploadField
              label="Cover Image"
              value={field.value}
              onChange={(value) => setValue("coverImageUrl", value)}
            />
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between rounded-xl border border-app-border bg-[#140f26] p-3">
          <p className="text-sm text-app-text-secondary">Host active in app</p>
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setValue("active", event.target.checked)}
            className="h-4 w-4 accent-app-accent"
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-app-border bg-[#140f26] p-3">
          <p className="text-sm text-app-text-secondary">Visible in app listing</p>
          <input
            type="checkbox"
            checked={visibleInApp}
            onChange={(event) => setValue("visibleInApp", event.target.checked)}
            className="h-4 w-4 accent-app-accent"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between rounded-xl border border-app-border bg-[#140f26] p-3">
          <p className="text-sm text-app-text-secondary">Featured Host</p>
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => setValue("featured", event.target.checked)}
            className="h-4 w-4 accent-app-accent"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-app-text-secondary">Priority Rank</label>
          <Input type="number" {...register("priorityRank")} />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-app-border pt-4">
        <Button
          variant="secondary"
          onClick={handleSubmit((values) => onSubmit(values, "draft"))}
          disabled={isSubmitting}
        >
          Save Draft
        </Button>
        <Button
          variant="secondary"
          onClick={handleSubmit((values) => onSubmit(values, "verify"))}
          disabled={isSubmitting}
        >
          Create & Verify
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Create Host
        </Button>
      </div>
    </form>
  );
}
