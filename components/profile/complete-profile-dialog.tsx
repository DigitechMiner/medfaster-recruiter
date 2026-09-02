"use client";

import { useRouter } from "next/navigation";
import { Clock3, ShieldAlert, UserRoundPen } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { JobCreateBlock } from "@/features/profile/completion";

type CompleteProfileDialogProps = {
  open: boolean;
  onDismiss: () => void;
  onComplete?: () => void;
  block: JobCreateBlock;
};

export function CompleteProfileDialog({
  open,
  onDismiss,
  onComplete,
  block,
}: CompleteProfileDialogProps) {
  const router = useRouter();
  const previewItems = block.items.slice(0, 4);
  const extraCount = Math.max(block.items.length - previewItems.length, 0);
  const Icon =
    block.kind === "under_review"
      ? Clock3
      : block.kind === "incomplete"
        ? UserRoundPen
        : ShieldAlert;

  const handleComplete = () => {
    onComplete?.();
    router.push(block.href);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onDismiss();
      }}
    >
      <DialogContent className="sm:max-w-md w-[90vw] max-w-[420px] rounded-xl p-0">
        <div className="flex flex-col items-center p-6 sm:p-8 text-center">
          <div className="mb-4 rounded-full bg-[#FFF3EC] p-3">
            <div className="rounded-full bg-[#F4781B] p-2.5">
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>

          <DialogHeader className="items-center space-y-2">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {block.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {block.description}
            </DialogDescription>
          </DialogHeader>

          {block.kind === "incomplete" && (
            <div className="mt-5 w-full">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-500">
                <span>Profile completion</span>
                <span className="text-[#F4781B]">{block.percentage}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#F4781B] transition-all"
                  style={{ width: `${Math.min(block.percentage, 100)}%` }}
                />
              </div>
            </div>
          )}

          {previewItems.length > 0 && (
            <ul className="mt-4 w-full space-y-1.5 text-left">
              {previewItems.map((item) => (
                <li
                  key={item}
                  className="rounded-lg bg-orange-50 px-3 py-2 text-sm text-gray-700"
                >
                  {item}
                </li>
              ))}
              {extraCount > 0 && (
                <li className="px-3 text-xs text-gray-400">
                  +{extraCount} more
                </li>
              )}
            </ul>
          )}

          <div className="mt-6 flex w-full flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded-lg border border-gray-200 py-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onDismiss}
            >
              Not now
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-lg bg-[#F4781B] py-5 text-sm font-semibold text-white hover:bg-[#e06a10]"
              onClick={handleComplete}
            >
              {block.actionLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
