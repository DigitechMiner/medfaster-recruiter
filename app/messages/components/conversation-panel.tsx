"use client";

import Link from "next/link";
import { memo } from "react";
import { MessagesSquare, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "./types";
import {
  formatDateLabel,
  formatTime,
  getAvatarColor,
  getCandidateName,
  getInitials,
} from "./utils";

const EmptyConversations = memo(function EmptyConversations() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <MessagesSquare className="h-5 w-5 text-muted-foreground/60" />
      </div>
      <p className="text-sm font-medium text-foreground">No conversations</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Chats from your workflow appear here
      </p>
    </div>
  );
});

const ConversationItem = memo(function ConversationItem({
  conv,
  isActive,
  onSelect,
}: {
  conv: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  const name = getCandidateName(conv);
  const color = getAvatarColor(conv.id);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(conv.id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(conv.id)}
      className={cn(
        "group relative flex w-full cursor-pointer items-start gap-3 border-b px-3 py-3.5 text-left transition-colors sm:px-4",
        "border-border/60",
        isActive
          ? "border-l-[3px] border-l-[#F4781B] bg-[#F4781B]/[0.08] dark:bg-orange-500/10"
          : "border-l-[3px] border-l-transparent hover:bg-muted/80",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          color,
        )}
      >
        {getInitials(name)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>

        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {conv.last_message ?? "No messages yet"}
        </p>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="truncate">
              {formatDateLabel(conv.last_message_at)} · {formatTime(conv.last_message_at)}
            </span>
          </p>
          {conv.recruiter_unread_count > 0 && (
            <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[#F4781B] px-1 text-[10px] font-medium text-white dark:bg-orange-500">
              {conv.recruiter_unread_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export const ConversationList = memo(function ConversationList({
  conversations,
  activeId,
  listError,
  onSelect,
}: {
  conversations: Conversation[];
  activeId: string | null;
  listError: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 w-full flex-shrink-0 flex-col overflow-hidden border-border bg-card md:min-w-[300px] md:w-[300px] md:max-w-[300px] md:border-r">
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-3 sm:px-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-[#F4781B] dark:hover:text-orange-400"
        >
          <ArrowLeft size={18} className="flex-shrink-0" />
          <span className="truncate">Home</span>
        </Link>
        <span className="hidden text-xs font-medium uppercase tracking-wide text-muted-foreground sm:inline">
          Messages
        </span>
      </div>

      {listError && (
        <div className="mx-3 mb-2 flex-shrink-0 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100 sm:mx-4">
          {listError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0">
        {conversations.length === 0 ? (
          <EmptyConversations />
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              isActive={conv.id === activeId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
});
