// hooks/useCandidateActions.ts
"use client";

import { useState } from "react";
import {
  updateApplicationStatus,
  inviteCandidateToJob,
} from "@/stores/api/recruiter-job-api";

type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEWING"
  | "INTERVIEWED"
  | "HIRE"
  | "REJECTED";

interface ActionState {
  loading: boolean;
  error:   string | null;
  success: boolean;
}

const DEFAULT_STATE: ActionState = { loading: false, error: null, success: false };

export function useCandidateActions() {
  const [states, setStates] = useState<Record<string, ActionState>>({});

  const setActionState = (key: string, state: Partial<ActionState>) =>
    setStates((prev) => ({ ...prev, [key]: { ...(prev[key] ?? DEFAULT_STATE), ...state } }));

  // ── Shortlist ──────────────────────────────────────────────────────────────
  const shortlist = async (applicationId: string) => {
    const key = `shortlist_${applicationId}`;
    setActionState(key, { loading: true, error: null, success: false });
    try {
      await updateApplicationStatus(applicationId, "SHORTLISTED");
      setActionState(key, { loading: false, success: true });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to shortlist candidate";
      setActionState(key, { loading: false, error: msg });
    }
  };

  // ── Direct Hire ────────────────────────────────────────────────────────────
  const directHire = async (applicationId: string) => {
    const key = `hire_${applicationId}`;
    setActionState(key, { loading: true, error: null, success: false });
    try {
      await updateApplicationStatus(applicationId, "HIRE");
      setActionState(key, { loading: false, success: true });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to hire candidate";
      setActionState(key, { loading: false, error: msg });
    }
  };

  // ── Invite for Job ─────────────────────────────────────────────────────────
  const inviteForJob = async (jobId: string, candidateId: string) => {
    const key = `invite_${candidateId}_${jobId}`;
    setActionState(key, { loading: true, error: null, success: false });
    try {
      await inviteCandidateToJob({ job_id: jobId, candidate_id: candidateId });
      setActionState(key, { loading: false, success: true });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to send invite";
      setActionState(key, { loading: false, error: msg });
    }
  };

  // ── Reject ─────────────────────────────────────────────────────────────────
  const reject = async (applicationId: string) => {
    const key = `reject_${applicationId}`;
    setActionState(key, { loading: true, error: null, success: false });
    try {
      await updateApplicationStatus(applicationId, "REJECTED");
      setActionState(key, { loading: false, success: true });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to reject candidate";
      setActionState(key, { loading: false, error: msg });
    }
  };

  const getState = (key: string): ActionState =>
    states[key] ?? DEFAULT_STATE;

  return { shortlist, directHire, inviteForJob, reject, getState };
}