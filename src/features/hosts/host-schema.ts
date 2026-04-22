import { z } from "zod";

export const hostFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  displayName: z.string().min(2, "Display name is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password should be at least 6 characters"),
  gender: z.enum(["male", "female", "other"]),
  age: z.coerce.number().min(18).max(80),
  bio: z.string().min(10, "Bio is required"),
  quote: z.string().min(3, "Quote is required"),
  category: z.string().min(2, "Category is required"),
  languages: z.string().min(2, "Languages are required"),
  specializationTags: z.string().optional(),
  experienceYears: z.coerce.number().min(0).max(50),
  education: z.string().optional(),
  skills: z.string().min(2, "Skills are required"),
  callRatePerMinute: z.coerce.number().min(1),
  chatRatePerMinute: z.coerce.number().min(1),
  minChatBalance: z.coerce.number().min(1),
  minCallBalance: z.coerce.number().min(1),
  availabilitySchedule: z.string().min(3, "Availability schedule is required"),
  verificationStatus: z.enum(["pending", "verified", "rejected"]),
  active: z.boolean().default(true),
  visibleInApp: z.boolean().default(true),
  featured: z.boolean().default(false),
  commissionPercent: z.coerce.number().min(0).max(100),
  priorityRank: z.coerce.number().min(1),
  profileImageUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

export type HostFormInputValues = z.input<typeof hostFormSchema>;
export type HostFormValues = z.output<typeof hostFormSchema>;
