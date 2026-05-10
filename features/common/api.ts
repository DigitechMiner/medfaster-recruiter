import { axiosInstance } from "@/stores/api/api-client";
import { ENDPOINTS } from "@/stores/api/api-endpoints";

import type {
  AppMetadata,
  AppMetadataFetchResult,
  Department,
  DepartmentsAndJobTitlesResult,
  MetadataOption,
  RegisterFcmPayload,
} from "./types";

// ── Departments + Job Titles ───────────────────────────────────────────────

export const fetchDepartmentsAndJobTitles =
  async (): Promise<DepartmentsAndJobTitlesResult> => {
    const res = await axiosInstance.get<{
      data: { departments: Department[]; jobTitles: MetadataOption[] };
    }>(ENDPOINTS.COMMON_DEPARTMENTS);
    return {
      departments: res.data.data?.departments ?? [],
      jobTitles: res.data.data?.jobTitles ?? [],
    };
  };

// ── Specializations ────────────────────────────────────────────────────────

export const fetchSpecializations = async (): Promise<MetadataOption[]> => {
  const res = await axiosInstance.get<{ data: { specialization: MetadataOption[] } }>(
    ENDPOINTS.COMMON_SPECIALIZATIONS,
  );
  return res.data.data?.specialization ?? [];
};

// ── App Metadata (gender, jobTypes, work_eligibility, shiftTypes) ──────────

export const fetchAppMetadata = async (version?: string): Promise<AppMetadataFetchResult> => {
  const query = version ? `?version=${version}` : "";
  const res = await axiosInstance.get<{
    updated: boolean;
    version: string;
    data: AppMetadata | null;
  }>(`${ENDPOINTS.COMMON_METADATA}${query}`);
  const body = res.data;
  return { updated: body.updated, version: body.version, data: body.data ?? null };
};

// ── FCM Device Registration ────────────────────────────────────────────────

export const registerFcmDevice = async (payload: RegisterFcmPayload) => {
  const res = await axiosInstance.post(ENDPOINTS.COMMON_FCM_REGISTER, payload);
  return res.data;
};

export const setDeviceActive = async (device_id: string, is_active: boolean) => {
  const res = await axiosInstance.post(ENDPOINTS.COMMON_DEVICE_ACTIVE, {
    device_id,
    is_active,
  });
  return res.data;
};
