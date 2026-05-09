"use client";

import { useState, memo, type RefObject } from "react";
import { cn } from "@/lib/utils";
import { MoreVertical, ArrowLeft, Send } from "lucide-react";
import type { ChatMessage, Conversation } from "../types";
import {
  formatDateLabel,
  formatTime,
  getAvatarColor,
  getCandidateName,
  getInitials,
} from "../utils";

export const ChatBubbleGlyph = memo(function ChatBubbleGlyph({
  size,
  className,
}: {
  size: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
});

export const EmptyMessages = memo(function EmptyMessages() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4781B]/10 dark:bg-orange-500/15">
        <ChatBubbleGlyph
          size={22}
          className="text-[#F4781B] dark:text-orange-400"
        />
      </div>
      <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
    </div>
  );
});

export const EmptySelection = memo(function EmptySelection() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F4781B]/10 dark:bg-orange-500/15">
        <ChatBubbleGlyph
          size={28}
          className="text-[#F4781B] dark:text-orange-400"
        />
      </div>
      <p className="font-semibold text-foreground">Select a conversation</p>
      <p className="text-sm text-muted-foreground max-sm:max-w-[260px]">
        Choose a chat from the list to start messaging
      </p>
    </div>
  );
});

export const ChatHeader = memo(function ChatHeader({
  convo,
  onMobileBack,
}: {
  convo: Conversation;
  onMobileBack?: () => void;
}) {
  const name = getCandidateName(convo);
  return (
    <div className="flex flex-shrink-0 items-center border-b border-border bg-card px-3 py-3 sm:px-6 sm:py-3.5">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {onMobileBack ? (
          <button
            type="button"
            onClick={onMobileBack}
            className="-ml-1 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={20} />
          </button>
        ) : null}
        <div
          className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            getAvatarColor(convo.id),
          )}
        >
          {getInitials(name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Online</p>
        </div>
      </div>
    </div>
  );
});

export const MessageBubble = memo(function MessageBubble({
  msg,
  onEdit,
  onDelete,
}: {
  msg: ChatMessage;
  onEdit: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");

  const isSent = msg.direction === "sent";

  const startEdit = () => {
    setEditText(msg.text);
    setEditing(true);
    setMenuOpen(false);
  };

  const saveEdit = async () => {
    if (editText.trim()) await onEdit(msg.id, editText.trim());
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditText("");
  };

  return (
    <div className={cn("flex flex-col gap-1", isSent ? "items-end" : "items-start")}>
      <div
        className={cn(
          "group relative flex items-center gap-1",
          isSent ? "flex-row-reverse" : "flex-row",
        )}
      >
        {editing ? (
          <div className="flex max-w-[min(92vw,24rem)] flex-col gap-2 sm:flex-row sm:items-center">
            <input
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              className="min-w-0 flex-1 rounded-xl border border-[#F4781B] bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring/30 focus:ring-2 dark:border-orange-500"
            />
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-lg bg-[#F4781B] px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-[#d5650e] dark:bg-orange-600 dark:hover:bg-orange-500"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/80"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "max-w-[min(85vw,28rem)] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-md",
              isSent
                ? "rounded-br-sm bg-[#F4781B] text-white dark:bg-orange-600"
                : "rounded-bl-sm bg-[#FDEBD0] text-foreground dark:bg-muted dark:text-foreground",
            )}
          >
            {msg.text}
          </div>
        )}

        {isSent && !editing && (
          <div className="relative opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((o) => !o);
              }}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Message actions"
            >
              <MoreVertical size={14} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute bottom-8 right-0 z-20 min-w-[110px] rounded-xl border border-border bg-popover py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={startEdit}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-popover-foreground transition-colors hover:bg-muted"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await onDelete(msg.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-destructive transition-colors hover:bg-destructive/10"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
    </div>
  );
});

export const MessageInput = memo(function MessageInput({
  value,
  sending,
  onChange,
  onSend,
}: {
  value: string;
  sending: boolean;
  onChange: (v: string) => void;
  onSend: () => void;
}) {
  const canSend = value.trim().length > 0 && !sending;

  return (
    <div className="relative flex flex-shrink-0 items-center gap-2 border-t border-border bg-card px-2 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
      <input
        type="text"
        placeholder="Type a message…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && canSend && onSend()}
        className="min-w-0 flex-1 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-[#F4781B] focus:bg-background focus:ring-2 focus:ring-[#F4781B]/20 dark:focus:border-orange-500 dark:focus:ring-orange-500/25 sm:px-4"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={!canSend}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4781B] transition-colors hover:bg-[#d5650e] disabled:pointer-events-none disabled:opacity-40 dark:bg-orange-600 dark:hover:bg-orange-500"
        aria-label="Send message"
      >
        <Send size={16} className="text-white" />
      </button>
    </div>
  );
});

export interface MessagesThreadProps {
  activeConvo: Conversation;
  messages: ChatMessage[];
  loadingMsgs: boolean;
  msgsError: string | null;
  inputText: string;
  sending: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onMobileBack: () => void;
  onEdit: (msgId: string, newText: string) => Promise<void>;
  onDelete: (msgId: string) => Promise<void>;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export const MessagesThread = memo(function MessagesThread({
  activeConvo,
  messages,
  loadingMsgs,
  msgsError,
  inputText,
  sending,
  messagesEndRef,
  onMobileBack,
  onEdit,
  onDelete,
  onInputChange,
  onSend,
}: MessagesThreadProps) {
  return (
    <>
      <ChatHeader convo={activeConvo} onMobileBack={onMobileBack} />

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
        {loadingMsgs ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-[#F4781B] dark:border-orange-400" />
          </div>
        ) : msgsError ? (
          <div className="flex justify-center py-8">
            <p className="text-xs text-destructive">{msgsError}</p>
          </div>
        ) : messages.length === 0 ? (
          <EmptyMessages />
        ) : (
          <>
            <div className="flex items-center justify-center">
              <span className="rounded-full bg-muted px-4 py-1 text-xs text-muted-foreground">
                {formatDateLabel(activeConvo.last_message_at)}
                <span className="mx-2 opacity-50">·</span>
                {formatTime(activeConvo.last_message_at)}
              </span>
            </div>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput
        value={inputText}
        sending={sending}
        onChange={onInputChange}
        onSend={onSend}
      />
    </>
  );
});
