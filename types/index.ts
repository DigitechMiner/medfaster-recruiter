/** Shared list pagination envelope used across recruiter APIs. */
export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  offset?: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type * from "@/features/profile/types";
export type * from "@/features/jobs/types";
export type * from "@/features/candidates/types";
export type * from "@/features/wallet/types";
export type * from "@/features/dashboard/types";
export * from "./view-models";
export * from "./candidate-job-picker";
