"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import { cn } from "@/lib/utils";
import {
  fetchChatConversations,
  fetchChatMessages,
  sendChatMessage,
  editChatMessage,
  deleteChatMessage,
} from "@/features/chat";
import { initRecruiterChatSocket } from "@/lib/chatSocket";
import { useAuthStore } from "@/stores/authStore";
import type { ChatMessage, Conversation } from "./components/types";
import { normalizeMessage } from "./components/utils";
import { ConversationList } from "./components/conversation-panel";
import {
  EmptySelection,
  MessagesThread,
} from "./components/messages-panel";

export default function MessagesPage() {
  const { recruiterProfile, loadRecruiterProfile } = useAuthStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [msgsError, setMsgsError] = useState<string | null>(null);

  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initRecruiterChatSocket().catch(console.error);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingList(true);
        setListError(null);
        if (!recruiterProfile) await loadRecruiterProfile();
        const data = (await fetchChatConversations()) as Conversation[];
        if (!mounted) return;
        setConversations(data ?? []);
        if (data?.length) setActiveId(data[0].id);
      } catch (err) {
        if (mounted) {
          setListError(
            err instanceof Error ? err.message : "Failed to load conversations",
          );
        }
      } finally {
        if (mounted) setLoadingList(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recruiterProfile]);

  useEffect(() => {
    if (!activeId) return;
    let mounted = true;
    (async () => {
      setLoadingMsgs(true);
      setMsgsError(null);
      try {
        const raw = (await fetchChatMessages(activeId)) as Record<string, unknown>[];
        if (!mounted) return;
        setMessages(
          raw?.length
            ? raw.map((m) => normalizeMessage(m, recruiterProfile?.id ?? ""))
            : [],
        );
      } catch (err) {
        if (mounted)
          setMsgsError(
            err instanceof Error ? err.message : "Failed to load messages",
          );
      } finally {
        if (mounted) setLoadingMsgs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activeId, recruiterProfile?.id]);

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !activeId || sending) return;
    const text = inputText.trim();
    setInputText("");
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      direction: "sent",
      text,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      setSending(true);
      const saved = (await sendChatMessage(activeId, text)) as Record<
        string,
        unknown
      > | null;
      if (saved) {
        const confirmed = normalizeMessage(saved, recruiterProfile?.id ?? "");
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? confirmed : m)),
        );
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                last_message: text,
                last_message_at: new Date().toISOString(),
              }
            : c,
        ),
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInputText(text);
    } finally {
      setSending(false);
    }
  }, [inputText, activeId, sending, recruiterProfile?.id]);

  const handleEdit = useCallback(async (msgId: string, newText: string) => {
    await editChatMessage(msgId, newText);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, text: newText } : m)),
    );
  }, []);

  const handleDelete = useCallback(async (msgId: string) => {
    await deleteChatMessage(msgId);
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  }, []);

  const activeConvo = useMemo(
    () => conversations.find((c) => c.id === activeId),
    [conversations, activeId],
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const syncDesktop = () => {
      if (mq.matches) setMobileListOpen(true);
    };
    mq.addEventListener("change", syncDesktop);
    syncDesktop();
    return () => mq.removeEventListener("change", syncDesktop);
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileListOpen(false);
    }
  }, []);

  const handleMobileBackToList = useCallback(() => {
    setMobileListOpen(true);
  }, []);

  if (loadingList) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] min-h-0 flex-col overflow-hidden bg-muted/30">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-[#F4781B] dark:border-orange-400" />
            <p className="text-sm text-muted-foreground">Loading conversations…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-0 flex-col overflow-hidden bg-muted/30">
      <div className="flex min-h-0 flex-1 flex-col items-stretch overflow-hidden md:flex-row">
        <div
          className={cn(
            "h-full min-h-0",
            mobileListOpen
              ? "flex min-h-0 flex-1 flex-col md:min-w-[300px] md:w-[300px] md:max-w-[300px] md:flex-none"
              : "hidden md:flex md:min-w-[300px] md:w-[300px] md:max-w-[300px] md:flex-none",
          )}
        >
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            listError={listError}
            onSelect={selectConversation}
          />
        </div>

        {activeConvo ? (
          <div
            className={cn(
              "flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background",
              mobileListOpen ? "hidden md:flex" : "flex",
            )}
          >
            <MessagesThread
              activeConvo={activeConvo}
              messages={messages}
              loadingMsgs={loadingMsgs}
              msgsError={msgsError}
              inputText={inputText}
              sending={sending}
              messagesEndRef={messagesEndRef}
              onMobileBack={handleMobileBackToList}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onInputChange={setInputText}
              onSend={handleSend}
            />
          </div>
        ) : (
          <div className="hidden min-h-0 flex-1 flex-col bg-background md:flex">
            <EmptySelection />
          </div>
        )}
      </div>
    </div>
  );
}
