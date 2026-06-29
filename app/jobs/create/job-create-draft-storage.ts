import type { JobFormSnapshot } from "@/stores/jobs-store";
import type { JobCreatePayload } from "@/types";

export type JobCreateDraftMode = "normal" | "instant";

export interface JobCreateDraftQuestion {
  id: string;
  text: string;
}

export interface JobCreateDraftSession {
  formSnapshot: JobFormSnapshot | null;
  step: number;
  pendingPayload: JobCreatePayload | null;
  wantsInterview?: boolean;
  aiQuestions?: JobCreateDraftQuestion[];
  savedAt: number;
}

const STORAGE_KEYS: Record<JobCreateDraftMode, string> = {
  normal: "medfaster:job-create-draft:normal",
  instant: "medfaster:job-create-draft:instant",
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadJobCreateDraft(
  mode: JobCreateDraftMode,
): JobCreateDraftSession | null {
  if (!isBrowser()) return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS[mode]);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as JobCreateDraftSession;
    if (!parsed || typeof parsed !== "object") return null;

    return parsed;
  } catch {
    return null;
  }
}

export function hasMeaningfulDraftContent(
  draft: Omit<JobCreateDraftSession, "savedAt">,
): boolean {
  if (draft.step > 1) return true;
  if (draft.pendingPayload) return true;

  const snapshot = draft.formSnapshot;
  if (!snapshot) return false;

  return Object.keys(snapshot).some((key) => {
    const value = snapshot[key as keyof JobFormSnapshot];
    if (value === undefined || value === null || value === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
}

export function saveJobCreateDraft(
  mode: JobCreateDraftMode,
  draft: Omit<JobCreateDraftSession, "savedAt">,
): void {
  if (!isBrowser()) return;

  if (!hasMeaningfulDraftContent(draft)) {
    clearJobCreateDraft(mode);
    return;
  }

  try {
    const payload: JobCreateDraftSession = {
      ...draft,
      savedAt: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEYS[mode], JSON.stringify(payload));
  } catch {
    // Ignore quota or serialization errors.
  }
}

export function clearJobCreateDraft(mode?: JobCreateDraftMode): void {
  if (!isBrowser()) return;

  if (mode) {
    sessionStorage.removeItem(STORAGE_KEYS[mode]);
    return;
  }

  (Object.keys(STORAGE_KEYS) as JobCreateDraftMode[]).forEach((key) => {
    sessionStorage.removeItem(STORAGE_KEYS[key]);
  });
}
