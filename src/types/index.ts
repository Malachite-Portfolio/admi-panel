export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  code?: string;
  data: T;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type AdminRole = "super_admin" | "admin" | "support_manager";

export type LoginPayload = {
  loginId: string;
  password: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  role: AdminRole;
  adminId: string;
  name: string;
  email: string;
};

export type HostVerificationStatus = "pending" | "verified" | "rejected";

export type HostAccountStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "blocked";

export type HostPresenceStatus = "online" | "offline" | "busy";

export type HostVisibilityStatus = "visible" | "hidden";

export type Host = {
  id: string;
  hostId: string;
  fullName: string;
  displayName: string;
  phone: string;
  email: string;
  gender: "male" | "female" | "other";
  age: number;
  category: string;
  languages: string[];
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  quote: string;
  bio: string;
  skills: string[];
  callRatePerMinute: number;
  chatRatePerMinute: number;
  minChatBalance: number;
  minCallBalance: number;
  totalCalls: number;
  totalChats: number;
  totalMinutes: number;
  completedSessions: number;
  cancellationRate: number;
  revenueGenerated: number;
  hostEarnings: number;
  platformCommission: number;
  status: HostAccountStatus;
  verificationStatus: HostVerificationStatus;
  visibility: HostVisibilityStatus;
  presence: HostPresenceStatus;
  featured: boolean;
  blockedNewSessions: boolean;
  joinedAt: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  availabilitySchedule?: string;
  adminNotes?: string;
  onboardingCompleted?: boolean;
  verificationNote?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  onboardingData?: Record<string, unknown>;
  profileImageRef?: string | null;
  governmentIdType?: string | null;
  governmentIdImageRef?: string | null;
};

export type HostListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  verified?: HostVerificationStatus | "all";
  accountStatus?: HostAccountStatus | "all";
  presence?: HostPresenceStatus | "all";
  visibility?: HostVisibilityStatus | "all";
  category?: string;
  language?: string;
  minRating?: number;
  sortBy?:
    | "joinedAt"
    | "rating"
    | "totalEarnings"
    | "experienceYears"
    | "callRate"
    | "chatRate";
  sortDirection?: "asc" | "desc";
};

export type HostAction =
  | "approve"
  | "reject"
  | "suspend"
  | "reactivate"
  | "hide"
  | "show"
  | "forceOffline"
  | "resetPassword"
  | "feature"
  | "unfeature"
  | "blockSessions"
  | "allowSessions";

export type HostCreatePayload = {
  fullName: string;
  displayName: string;
  phone: string;
  email: string;
  password: string;
  gender: "male" | "female" | "other";
  age: number;
  bio: string;
  quote: string;
  category: string;
  languages: string[];
  specializationTags: string[];
  experienceYears: number;
  education?: string;
  skills: string[];
  callRatePerMinute: number;
  chatRatePerMinute: number;
  minChatBalance: number;
  minCallBalance: number;
  availabilitySchedule: string;
  verificationStatus: HostVerificationStatus;
  active: boolean;
  visibleInApp: boolean;
  featured: boolean;
  commissionPercent: number;
  priorityRank: number;
};

export type HostPerformance = {
  totalCalls: number;
  totalChats: number;
  totalMinutes: number;
  totalCompletedSessions: number;
  averageRating: number;
  reviewsCount: number;
  cancellationRate: number;
  revenueGenerated: number;
  hostEarnings: number;
  platformCommission: number;
};

export type HostSessionHistoryItem = {
  id: string;
  type: "call" | "chat";
  userName: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  billedAmount: number;
  status: "active" | "ended" | "cancelled" | "missed";
};

export type UserAccountStatus = "active" | "inactive" | "suspended" | "blocked";

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  referralCode: string;
  walletBalance: number;
  totalRecharge: number;
  totalSpent: number;
  status: UserAccountStatus;
  joinedAt: string;
};

export type WalletOverview = {
  totalRechargeVolume: number;
  pendingPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refunds: number;
  couponUsage: number;
};

export type WalletTransactionType =
  | "recharge"
  | "call_debit"
  | "chat_debit"
  | "referral_bonus"
  | "refund"
  | "admin_credit"
  | "admin_debit"
  | "promo_credit";

export type WalletTransaction = {
  id: string;
  userName: string;
  userId: string;
  type: WalletTransactionType;
  amount: number;
  status: "pending" | "success" | "failed" | "refunded";
  balanceBefore: number;
  balanceAfter: number;
  paymentMethod?: string;
  createdAt: string;
};

export type WithdrawalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "PAYMENT_DONE";

export type WithdrawalSummaryCounts = {
  pending: number;
  approved: number;
  inProgress: number;
  paymentDone: number;
  rejected: number;
};

export type AdminWithdrawal = {
  id: string;
  listenerId: string;
  amount: number;
  status: WithdrawalStatus;
  bankName: string;
  accountHolderName: string;
  accountNumberLast4: string;
  ifscCode: string;
  requestedAt: string;
  approvedAt?: string | null;
  processingAt?: string | null;
  paidAt?: string | null;
  rejectedAt?: string | null;
  adminNote?: string | null;
  transactionReference?: string | null;
  approvedByAdminId?: string | null;
  createdAt: string;
  updatedAt: string;
  listener?: {
    id: string;
    displayName: string;
    phone: string;
  };
  approvedByAdmin?: {
    id: string;
    displayName: string;
    phone: string;
  };
};

export type AdminWithdrawalListResponse = {
  items: AdminWithdrawal[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type UpdateWithdrawalStatusPayload = {
  status: Exclude<WithdrawalStatus, "PENDING">;
  adminNote?: string;
  transactionReference?: string;
};

export type WithdrawalStatusUpdateResult = {
  request: AdminWithdrawal;
  wallet: {
    availableBalance: number;
    lockedWithdrawalBalance: number;
    currency: string;
  };
};

export type AdminKycStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
export type AdminKycSource = "KYC_VERIFICATION" | "LISTENER_ONBOARDING";

export type AdminKycListItem = {
  id: string;
  submissionId: string;
  userId: string;
  hostListenerId: string | null;
  source: AdminKycSource;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  profilePhotoUrl: string | null;
  role: string | null;
  category: string | null;
  languages: string[];
  status: AdminKycStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
};

export type AdminKycDetail = AdminKycListItem & {
  aadhaarLast4: string | null;
  dob: string | null;
  reviewNote: string | null;
  aadhaarFrontUrl: string | null;
  aadhaarBackUrl: string | null;
  selfieUrl: string | null;
  governmentIdUrl: string | null;
  governmentIdType: string | null;
  onboardingData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  listenerVerificationStatus: string | null;
  listenerVerificationNote: string | null;
};

export type AdminKycListResponse = {
  items: AdminKycListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ReferralRecord = {
  id: string;
  referralCode: string;
  inviterName: string;
  invitedUserName: string;
  rewardStatus: "invited" | "signed_up" | "qualified" | "rewarded" | "expired";
  rewardAmount: number;
  qualifyingTransaction?: string;
  rewardedAt?: string;
  createdAt: string;
};

export type SupportTicketPriority = "low" | "medium" | "high" | "critical";

export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type SupportTicket = {
  id: string;
  userName: string;
  hostName?: string;
  subject: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  createdAt: string;
};

export type LiveSessionStatus =
  | "ringing"
  | "active"
  | "ended"
  | "cancelled"
  | "insufficient_balance";

export type LiveSession = {
  id: string;
  type: "call" | "chat";
  userName: string;
  hostName: string;
  startTime: string;
  runningDurationSeconds: number;
  currentBilling: number;
  status: LiveSessionStatus;
};

export type DashboardSummary = {
  totalUsers: number;
  totalHosts: number;
  activeHosts: number;
  liveCalls: number;
  liveChats: number;
  liveCallsNow?: number;
  liveChatsNow?: number;
  rechargeToday: number;
  revenueToday: number;
  pendingHostApprovals: number;
  pendingWithdrawals: number;
};

export type RevenuePoint = {
  label: string;
  revenue: number;
  recharge: number;
  callMinutes: number;
  chatSessions: number;
};

export type TopEarningHost = {
  hostName: string;
  amount: number;
};

export type UsageSummary = {
  totalCallMinutes: number;
  totalChatMinutes: number;
  totalSpent: number;
  totalRecharged: number;
  currentBalance: number;
  referralEarned: number;
  sessionsCompleted: number;
};

export type SidebarData = {
  profile: {
    id: string;
    name: string;
    phone: string;
    role: AdminRole;
    avatarUrl?: string;
  };
  menuBadges: Record<string, number>;
  walletSummary: {
    totalRevenue: number;
    pendingPayments: number;
  };
  appVersion: string;
};

export type ReferralSettings = {
  inviterReward: number;
  invitedReward: number;
  qualifyingRechargeAmount: number;
  faqContent: { question: string; answer: string }[];
};

export type AppSettings = {
  minimumBalanceCall: number;
  minimumBalanceChat: number;
  lowBalanceWarningThresholdMinutes: number;
  rechargePlans: number[];
  featureToggles: Record<string, boolean>;
  referral: ReferralSettings;
};

export type HostPriceLog = {
  id: string;
  hostId: string;
  changedBy: string;
  oldCallRate: number;
  newCallRate: number;
  oldChatRate: number;
  newChatRate: number;
  changedAt: string;
};
