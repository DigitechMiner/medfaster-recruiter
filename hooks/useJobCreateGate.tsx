"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CompleteProfileDialog } from "@/components/profile/complete-profile-dialog";
import { getJobCreateBlock } from "@/features/profile/completion";
import { useAuthStore } from "@/stores/authStore";

export function useJobCreateGate() {
  const router = useRouter();
  const recruiterProfile = useAuthStore((s) => s.recruiterProfile);
  const recruiterDocuments = useAuthStore((s) => s.recruiterDocuments);
  const [dialogOpen, setDialogOpen] = useState(false);

  const block = useMemo(
    () => getJobCreateBlock(recruiterProfile, recruiterDocuments),
    [recruiterProfile, recruiterDocuments],
  );
  const canCreate = block === null;

  const goToCreate = (href: string) => {
    if (block) {
      setDialogOpen(true);
      return;
    }
    router.push(href);
  };

  const completeProfileDialog = block ? (
    <CompleteProfileDialog
      open={dialogOpen}
      onDismiss={() => setDialogOpen(false)}
      onComplete={() => setDialogOpen(false)}
      block={block}
    />
  ) : null;

  return { goToCreate, canCreate, completeProfileDialog };
}
