import { API_ENDPOINTS } from "@/constants/api";
import { api } from "@/services/http";
import type {
  AdminKycDetail,
  AdminKycListItem,
  AdminKycListResponse,
  AdminKycSource,
  AdminKycStatus,
  ApiResponse,
} from "@/types";

type AdminKycListPayload = {
  items?: Array<Partial<AdminKycListItem>>;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

type AdminKycDetailPayload = Partial<AdminKycDetail>;

const LISTENER_KYC_PREFIX = "listener_";
const inflightListRequests = new Map<string, Promise<AdminKycListResponse>>();
const inflightDetailRequests = new Map<string, Promise<AdminKycDetail>>();

function unwrapApiData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    return ((payload as Record<string, unknown>).data ?? {}) as T;
  }
  return (payload ?? {}) as T;
}

function normalizePagination(
  payload: AdminKycListPayload | AdminKycListResponse,
  fallbackPage: number,
  fallbackLimit: number,
  fallbackTotal: number
) {
  const recordPayload = payload as Record<string, unknown>;
  const pagination = (payload as AdminKycListPayload).pagination;
  const page = Number(
    pagination?.page ??
      recordPayload.page ??
      fallbackPage
  );
  const limit = Number(
    pagination?.limit ??
      recordPayload.limit ??
      fallbackLimit
  );
  const total = Number(
    pagination?.total ??
      recordPayload.total ??
      fallbackTotal
  );
  const totalPages = Number(
    pagination?.totalPages ??
      recordPayload.totalPages ??
      Math.ceil(total / Math.max(1, limit))
  );

  return {
    page,
    limit,
    total,
    totalPages,
  };
}

const normalizeKycStatus = (value?: string | null): AdminKycStatus => {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "PENDING_VERIFICATION") {
    return "PENDING";
  }
  if (normalized === "PENDING" || normalized === "APPROVED" || normalized === "REJECTED") {
    return normalized;
  }
  return "DRAFT";
};

const normalizeKycSource = (value?: string | null, id?: string): AdminKycSource => {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "LISTENER_ONBOARDING") {
    return "LISTENER_ONBOARDING";
  }
  if (String(id || "").startsWith(LISTENER_KYC_PREFIX)) {
    return "LISTENER_ONBOARDING";
  }
  return "KYC_VERIFICATION";
};

const mapKycListItem = (item: Partial<AdminKycListItem>): AdminKycListItem => ({
  id: String(item.id || item.submissionId || ""),
  submissionId: String(item.submissionId || item.id || ""),
  userId: String(item.userId || ""),
  hostListenerId: item.hostListenerId || null,
  source: normalizeKycSource((item as { source?: string | null }).source, item.id),
  fullName: item.fullName || null,
  phone: item.phone || null,
  email: item.email || null,
  profilePhotoUrl: item.profilePhotoUrl || null,
  role: item.role || null,
  category: item.category || null,
  languages: Array.isArray(item.languages) ? item.languages : [],
  status: normalizeKycStatus(item.status),
  submittedAt: item.submittedAt || null,
  reviewedAt: item.reviewedAt || null,
});

const mapKycDetail = (payload: AdminKycDetailPayload): AdminKycDetail => ({
  ...mapKycListItem(payload),
  aadhaarLast4: payload.aadhaarLast4 || null,
  dob: payload.dob || null,
  reviewNote: payload.reviewNote || null,
  aadhaarFrontUrl: payload.aadhaarFrontUrl || null,
  aadhaarBackUrl: payload.aadhaarBackUrl || null,
  selfieUrl: payload.selfieUrl || null,
  governmentIdUrl: payload.governmentIdUrl || null,
  governmentIdType: payload.governmentIdType || null,
  onboardingData:
    payload.onboardingData && typeof payload.onboardingData === "object"
      ? (payload.onboardingData as Record<string, unknown>)
      : null,
  createdAt: String(payload.createdAt || ""),
  updatedAt: String(payload.updatedAt || ""),
  listenerVerificationStatus: payload.listenerVerificationStatus || null,
  listenerVerificationNote: payload.listenerVerificationNote || null,
});

const listRequestKey = (input: {
  page: number;
  limit: number;
  status: string;
  source: string;
  role: string;
  search: string;
}) => `${input.page}:${input.limit}:${input.status}:${input.source}:${input.role}:${input.search}`;

export const kycService = {
  async getKycList(input: {
    page?: number;
    limit?: number;
    status?: string;
    source?: "KYC_VERIFICATION" | "LISTENER_ONBOARDING" | "ALL";
    role?: "LISTENER" | "USER" | "ADMIN" | "ALL";
    search?: string;
  } = {}) {
    const page = Number(input.page || 1);
    const limit = Number(input.limit || 20);
    const status = String(input.status || "ALL").toUpperCase();
    const source = String(input.source || "ALL").toUpperCase();
    const role = String(input.role || "ALL").toUpperCase();
    const search = String(input.search || "").trim();

    const key = listRequestKey({ page, limit, status, source, role, search });
    const existing = inflightListRequests.get(key);
    if (existing) {
      return existing;
    }

    const requestPromise = (async () => {
      const response = await api.get<ApiResponse<AdminKycListPayload>>(API_ENDPOINTS.kyc.list, {
        params: {
          page,
          limit,
          status,
          source,
          role,
          search: search || undefined,
        },
      });

      const payload = unwrapApiData<AdminKycListPayload | AdminKycListResponse>(response.data);
      const items = (payload.items || []).map(mapKycListItem);
      const pagination = normalizePagination(payload, page, limit, items.length);

      return {
        items,
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      } satisfies AdminKycListResponse;
    })();

    inflightListRequests.set(key, requestPromise);
    try {
      return await requestPromise;
    } finally {
      inflightListRequests.delete(key);
    }
  },

  async getKycById(kycId: string) {
    const normalizedKycId = String(kycId || "").trim();
    const existing = inflightDetailRequests.get(normalizedKycId);
    if (existing) {
      return existing;
    }

    const requestPromise = (async () => {
      const response = await api.get<ApiResponse<AdminKycDetailPayload>>(
        API_ENDPOINTS.kyc.byId(normalizedKycId)
      );
      return mapKycDetail(unwrapApiData<AdminKycDetailPayload>(response.data));
    })();

    inflightDetailRequests.set(normalizedKycId, requestPromise);
    try {
      return await requestPromise;
    } finally {
      inflightDetailRequests.delete(normalizedKycId);
    }
  },

  async approveKyc(kycId: string) {
    const response = await api.patch<ApiResponse<AdminKycDetailPayload>>(API_ENDPOINTS.kyc.review(kycId), {
      status: "APPROVED",
    });
    return mapKycDetail(unwrapApiData<AdminKycDetailPayload>(response.data));
  },

  async rejectKyc(kycId: string, reviewNote: string) {
    const response = await api.patch<ApiResponse<AdminKycDetailPayload>>(API_ENDPOINTS.kyc.review(kycId), {
      status: "REJECTED",
      reviewNote,
    });
    return mapKycDetail(unwrapApiData<AdminKycDetailPayload>(response.data));
  },
};
