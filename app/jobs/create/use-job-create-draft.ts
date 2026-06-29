"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useJobsStore } from "@/stores/jobs-store";
import type { JobCreatePayload } from "@/types";
import type { AIQuestion } from "./form/question-form";
import {
  type JobCreateDraftMode,
  type JobCreateDraftSession,
  loadJobCreateDraft,
  saveJobCreateDraft,
} from "./job-create-draft-storage";

interface UseJobCreateDraftOptions {
  mode: JobCreateDraftMode;
  step: number;
  pendingPayload: JobCreatePayload | null;
  wantsInterview?: boolean;
  aiQuestions?: AIQuestion[];
  onRestore: (draft: JobCreateDraftSession) => void;
}

export function useJobCreateDraft({
  mode,
  step,
  pendingPayload,
  wantsInterview,
  aiQuestions,
  onRestore,
}: UseJobCreateDraftOptions) {
  const formSnapshot = useJobsStore((state) => state.formSnapshot);
  const setFormSnapshot = useJobsStore((state) => state.setFormSnapshot);
  const [isHydrated, setIsHydrated] = useState(false);
  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  useLayoutEffect(() => {
    const saved = loadJobCreateDraft(mode);

    if (saved) {
      if (saved.formSnapshot) {
        setFormSnapshot(saved.formSnapshot);
      }
      onRestoreRef.current(saved);
    }

    setIsHydrated(true);
  }, [mode, setFormSnapshot]);

  useEffect(() => {
    if (!isHydrated) return;

    saveJobCreateDraft(mode, {
      formSnapshot,
      step,
      pendingPayload,
      wantsInterview,
      aiQuestions,
    });
  }, [
    aiQuestions,
    formSnapshot,
    isHydrated,
    mode,
    pendingPayload,
    step,
    wantsInterview,
  ]);

  useEffect(() => {
    if (!isHydrated) return;

    return () => {
      saveJobCreateDraft(mode, {
        formSnapshot: useJobsStore.getState().formSnapshot,
        step,
        pendingPayload,
        wantsInterview,
        aiQuestions,
      });
    };
  }, [
    aiQuestions,
    formSnapshot,
    isHydrated,
    mode,
    pendingPayload,
    step,
    wantsInterview,
  ]);

  return { isHydrated };
}
