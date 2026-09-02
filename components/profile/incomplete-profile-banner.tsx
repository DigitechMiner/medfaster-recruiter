"use client";

import Link from "next/link";
import { AlertCircle, Clock3 } from "lucide-react";

import type { JobCreateBlock } from "@/features/profile/completion";

type IncompleteProfileBannerProps = {
  block: JobCreateBlock;
};

export function IncompleteProfileBanner({
  block,
}: IncompleteProfileBannerProps) {
  const Icon = block.kind === "under_review" ? Clock3 : AlertCircle;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-orange-200 bg-[#FFF7F0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4781B]/10">
          <Icon className="h-4 w-4 text-[#F4781B]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{block.title}</p>
          <p className="mt-0.5 text-sm text-gray-600">{block.description}</p>
          {block.items.length > 0 && (
            <p className="mt-1 text-sm font-medium text-[#C45A10]">
              {block.items.join(" · ")}
            </p>
          )}
          {block.kind === "incomplete" && (
            <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-orange-100">
              <div
                className="h-full rounded-full bg-[#F4781B]"
                style={{ width: `${Math.min(block.percentage, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
      <Link
        href={block.href}
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#F4781B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e06a10]"
      >
        {block.actionLabel}
      </Link>
    </div>
  );
}
