"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  fetchChatConversations, createOrGetChatConversation,
  fetchChatMessages, sendChatMessage, editChatMessage, deleteChatMessage,
  uploadChatFile,
} from "@/stores/api/chat-api";
import { initRecruiterChatSocket } from "@/lib/chatSocket";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/global/navbar";

import { Conversation, ChatMessage, normalizeMessage, formatTime, formatDateLabel } from "@/components/messages/types";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatHeader } from "@/components/messages/ChatHeader";
import { MessageBubble } from "@/components/messages/MessageBubble";
import { MessageInput } from "@/components/messages/MessageInput";
import { EmptyMessages, EmptySelection } from "@/components/messages/EmptyState";
import { toast } from "react-toastify";



export default function MessagesPage() {
  const { recruiterProfile, loadRecruiterProfile } = useAuthStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingList, setLoadingList]     = useState(true);
  const [listError, setListError]         = useState<string | null>(null);
  const [search, setSearch]               = useState("");

  const [activeId, setActiveId]           = useState<string | null>(null);
  const [messages, setMessages]           = useState<ChatMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [msgsError, setMsgsError]         = useState<string | null>(null);

  const [inputText, setInputText]         = useState("");
  const [sending, setSending]             = useState(false);

  const [showNewChat, setShowNewChat]     = useState(false);
  const [candidateId, setCandidateId]     = useState("");
  const [creatingChat, setCreatingChat]   = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Socket ───────────────────────────────────────────────────────────────
  useEffect(() => { initRecruiterChatSocket().catch(console.error); }, []);

  // ── Load conversations ───────────────────────────────────────────────────
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
          setListError(err instanceof Error ? err.message : "Failed to load conversations");
        }
      } finally {
        if (mounted) setLoadingList(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recruiterProfile]);

  // ── Load messages ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeId) return;
    let mounted = true;
    (async () => {
      setLoadingMsgs(true);
      setMsgsError(null);
      try {
        const raw = (await fetchChatMessages(activeId)) as Record<string, unknown>[];
        if (!mounted) return;
        setMessages(raw?.length ? raw.map((m) => normalizeMessage(m, recruiterProfile?.id ?? "")) : []);
      } catch (err) {
        if (mounted) setMsgsError(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        if (mounted) setLoadingMsgs(false);
      }
    })();
    return () => { mounted = false; };
  }, [activeId, recruiterProfile?.id]);

  // ── Auto scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleStar = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, starred: !c.starred } : c));
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !activeId || sending) return;
    const text = inputText.trim();
    setInputText("");
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`, type: "text", direction: "sent", text,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      setSending(true);
      const saved = (await sendChatMessage(activeId, text)) as Record<string, unknown> | null;
      if (saved) {
        const confirmed = normalizeMessage(saved, recruiterProfile?.id ?? "");
        setMessages((prev) => prev.map((m) => m.id === optimistic.id ? confirmed : m));
      }
      setConversations((prev) => prev.map((c) =>
        c.id === activeId ? { ...c, last_message: text, last_message_at: new Date().toISOString() } : c
      ));
    } catch (err) {
      console.error("❌ Send failed:", err);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInputText(text);
    } finally {
      setSending(false);
    }
  }, [inputText, activeId, sending, recruiterProfile?.id]);

  const handleEdit = useCallback(async (msgId: string, newText: string) => {
    await editChatMessage(msgId, newText);
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, text: newText } : m));
  }, []);

  const handleDelete = useCallback(async (msgId: string) => {
    await deleteChatMessage(msgId);
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  }, []);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId.trim()) return;
    setCreatingChat(true);
    try {
      const conv = (await createOrGetChatConversation(candidateId.trim())) as Conversation;
      setConversations((prev) => prev.find((c) => c.id === conv.id) ? prev : [conv, ...prev]);
      setActiveId(conv.id);
      setShowNewChat(false);
      setCandidateId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start conversation.");
    } finally {
      setCreatingChat(false);
    }
  };
  // ── Send file ────────────────────────────────────────────────────────────
const handleSendFile = useCallback(async (file: File) => {
  if (!activeId) return;
  try {
    // 1. Upload file → get URL back
    const { fileUrl, fileName } = await uploadChatFile(file);
    // 2. Send message with file metadata
    const saved = await sendChatMessage(activeId, fileName, "text", fileUrl, fileName) as Record<string, unknown>;
    if (saved) {
      const msg = normalizeMessage(saved, recruiterProfile?.id ?? "");
      setMessages((prev) => [...prev, msg]);
    }
    setConversations((prev) => prev.map((c) =>
      c.id === activeId ? { ...c, last_message: `📎 ${fileName}`, last_message_at: new Date().toISOString() } : c
    ));
  } catch (err) {
    console.error("❌ File send failed:", err);
  }
}, [activeId, recruiterProfile?.id]);

// ── Send voice ────────────────────────────────────────────────────────────
const handleSendVoice = useCallback(async (blob: Blob, duration: string) => {
  if (!activeId) return;
  try {
    const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
    const { fileUrl, fileName } = await uploadChatFile(file);
    const saved = await sendChatMessage(activeId, fileName, "voice", fileUrl, fileName) as Record<string, unknown>;
    if (saved) {
      // Inject duration into raw before normalizing so VoiceMessage renders correctly
      const msg = normalizeMessage({ ...saved, duration }, recruiterProfile?.id ?? "");
      setMessages((prev) => [...prev, msg]);
    }
    setConversations((prev) => prev.map((c) =>
      c.id === activeId ? { ...c, last_message: "🎙 Voice note", last_message_at: new Date().toISOString() } : c
    ));
  } catch (err) {
    console.error("❌ Voice send failed:", err);
  }
}, [activeId, recruiterProfile?.id]);

  const activeConvo = conversations.find((c) => c.id === activeId);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loadingList) {
    return (
      <div className="h-screen overflow-hidden flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-[#F5F2EE]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F4781B] mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Navbar />
      <div className="flex flex-1 bg-[#F5F2EE] overflow-hidden min-h-0">

        <ConversationList
          conversations={conversations}
          activeId={activeId}
          listError={listError}
          search={search}
          showNewChat={showNewChat}
          candidateId={candidateId}
          creatingChat={creatingChat}
          onSearch={setSearch}
          onSelect={setActiveId}
          onToggleStar={toggleStar}
          onToggleNewChat={() => setShowNewChat((v) => !v)}
          onCandidateIdChange={setCandidateId}
          onStartChat={handleStartChat}
        />

        {activeConvo ? (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <ChatHeader convo={activeConvo} onToggleStar={toggleStar} />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-4">
              {loadingMsgs ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F4781B]" />
                </div>
              ) : msgsError ? (
                <div className="flex justify-center py-8">
                  <p className="text-xs text-red-400">{msgsError}</p>
                </div>
              ) : messages.length === 0 ? (
                <EmptyMessages />
              ) : (
                <>
                  <div className="flex items-center justify-center">
                    <span className="text-xs text-gray-400 bg-[#EDE9E3] px-4 py-1 rounded-full">
                      {formatDateLabel(activeConvo.last_message_at)}&nbsp;&nbsp;|&nbsp;&nbsp;
                      {formatTime(activeConvo.last_message_at)}
                    </span>
                  </div>
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <MessageInput
  value={inputText}
  sending={sending}
  onChange={setInputText}
  onSend={handleSend}
  onSendFile={handleSendFile}     
  onSendVoice={handleSendVoice}
/>
          </div>
        ) : (
          <EmptySelection />
        )}
      </div>
    </div>
  );
}