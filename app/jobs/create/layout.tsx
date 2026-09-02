"use client";

import { useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { CompleteProfileDialog } from "@/components/profile/complete-profile-dialog";
import { getJobCreateBlock } from "@/features/profile/completion";
import { useAuthStore } from "@/stores/authStore";

export default function JobCreateLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const recruiterProfile = useAuthStore((s) => s.recruiterProfile);
  const recruiterDocuments = useAuthStore((s) => s.recruiterDocuments);
  const block = useMemo(
    () => getJobCreateBlock(recruiterProfile, recruiterDocuments),
    [recruiterProfile, recruiterDocuments],
  );

  if (!block) {
    return children;
  }

  return (
    <CompleteProfileDialog
      open
      onDismiss={() => router.replace("/")}
      block={block}
    />
  );
}
