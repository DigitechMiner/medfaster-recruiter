"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Search, Star, MoreVertical, ChevronDown,
  Play, Plus, Smile, Mic, ThumbsUp, Send, X,
} from "lucide-react";
import {
  fetchChatConversations,
  createOrGetChatConversation,
  fetchChatMessages,
  sendChatMessage,
} from "@/stores/api/chat-api";
import { initRecruiterChatSocket } from "@/lib/chatSocket";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/global/navbar";

// ── Types ──────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  recruiter_id: string;
  candidate_id: string;
  last_message: string | null;
  last_message_at: string | null;
  recruiter_unread_count: number;
  starred?: boolean;
  candidate?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

interface ChatMessage {
  id: string;
  text?: string;
  type: "text" | "voice";
  direction: "sent" | "received";
  time: string;
  duration?: string;
}

// ── Avatar Color Map ───────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-rose-100 text-rose-700",
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-orange-100 text-orange-700",
  "bg-green-100 text-green-700",
  "bg-indigo-100 text-indigo-700",
];

// ── Helpers ────────────────────────────────────────────────────────────────

const getAvatarColor = (id: string) =>
  AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

const getCandidateName = (conv: Conversation) => {
  if (conv.candidate?.first_name || conv.candidate?.last_name)
    return `${conv.candidate.first_name ?? ""} ${conv.candidate.last_name ?? ""}`.trim();
  return conv.candidate?.email ?? "Candidate";
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatTime = (dateStr: string | null) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const formatDateLabel = (dateStr: string | null) => {
  if (!dateStr) return "Today";
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

// ── Normalize API message → ChatMessage ───────────────────────────────────

// ✅ Maps whatever shape your API returns to the ChatMessage interface
// Adjust field names here if your API uses different keys
function normalizeMessage(raw: Record<string, unknown>, currentRecruiterId: string): ChatMessage {
  const senderId = (raw.sender_id ?? raw.senderId ?? raw.recruiter_id ?? "") as string;
  const isVoice  = (raw.type ?? raw.message_type ?? "text") === "voice";
  const sentAt   = (raw.sent_at ?? raw.created_at ?? raw.createdAt ?? null) as string | null;

  return {
    id:        (raw.id ?? raw.message_id ?? `msg-${Math.random()}`) as string,
    type:      isVoice ? "voice" : "text",
    direction: senderId === currentRecruiterId ? "sent" : "received",
    // ✅ Added `raw.message` to match what your sendChatMessage posts
    text:      isVoice ? undefined : ((raw.message ?? raw.text ?? raw.content ?? "") as string),
    duration:  isVoice ? ((raw.duration ?? "0:00") as string) : undefined,
    time:      sentAt
      ? new Date(sentAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
      : new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

// ── Voice Message ──────────────────────────────────────────────────────────

const VoiceMessage = ({ duration }: { duration: string }) => {
  const bars = [3, 5, 8, 12, 16, 10, 14, 18, 12, 8, 15, 20, 14, 10, 6, 12, 18, 14, 8, 5, 10, 16, 12, 8, 4];
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-[#FDEBD0] rounded-2xl rounded-bl-sm w-64">
      <button
        type="button"
        className="w-8 h-8 bg-[#F4781B] rounded-full flex items-center justify-center hover:bg-[#e06510] transition-colors flex-shrink-0"
      >
        <Play size={13} className="text-white ml-0.5" />
      </button>
      <div className="flex items-center gap-[2px] flex-1 h-8">
        {bars.map((h, i) => (
          <div key={i} className="w-[2px] rounded-full bg-[#F4781B] opacity-60" style={{ height: `${h}px` }} />
        ))}
      </div>
      <span className="text-xs text-[#F4781B] font-medium flex-shrink-0">{duration}</span>
    </div>
  );
};

// ── Empty States ───────────────────────────────────────────────────────────

const EmptyConversations = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <Search className="w-5 h-5 text-gray-300" />
    </div>
    <p className="text-sm font-medium text-gray-600">No conversations</p>
    <p className="text-xs text-gray-400 mt-1">Use + to start a new chat</p>
  </div>
);

const EmptyMessages = () => (
  <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </div>
    <p className="text-sm text-gray-500">No messages yet. Say hello!</p>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────

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

  // ── Socket init ──────────────────────────────────────────────────────────
  useEffect(() => {
    initRecruiterChatSocket().catch(console.error);
  }, []);

  // ── Load conversations ───────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoadingList(true);
        setListError(null);
        if (!recruiterProfile) await loadRecruiterProfile();
        const data = (await fetchChatConversations()) as Conversation[];
        console.log("📋 raw conversation:", JSON.stringify(data?.[0], null, 2));
        if (!mounted) return;
        if (data?.length) {
          setConversations(data);
          setActiveId(data[0].id);
        } else {
          // ✅ API returned empty — show empty state, not mock data
          setConversations([]);
          setActiveId(null);
        }
      } catch (err) {
        if (!mounted) return;
        setListError(err instanceof Error ? err.message : "Failed to load conversations");
        setConversations([]);
        setActiveId(null);
      } finally {
        if (mounted) setLoadingList(false);
      }
    }
    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recruiterProfile]);

  // ── Load messages for active conversation ────────────────────────────────
  useEffect(() => {
    if (!activeId) return;
    let mounted = true;

    async function loadMessages() {
      setLoadingMsgs(true);
      setMsgsError(null);
      try {
        // ✅ fetchChatMessages must accept a conversationId and return raw messages
        const raw = (await fetchChatMessages(activeId!)) as Record<string, unknown>[];
        console.log("💬 raw messages:", JSON.stringify(raw?.[0], null, 2));
        if (!mounted) return;

        const recruiterId = recruiterProfile?.id ?? "";

        if (raw?.length) {
          setMessages(raw.map((m) => normalizeMessage(m, recruiterId)));
        } else {
          // ✅ Empty messages — show empty state
          setMessages([]);
        }
      } catch (err) {
        if (!mounted) return;
        setMsgsError(err instanceof Error ? err.message : "Failed to load messages");
        setMessages([]);
      } finally {
        if (mounted) setLoadingMsgs(false);
      }
    }

    loadMessages();
    return () => { mounted = false; };
  }, [activeId, recruiterProfile?.id]);

  // ── Auto scroll to bottom ────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Toggle star (local only — extend with API call if needed) ────────────
  const toggleStar = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, starred: !c.starred } : c))
    );
  }, []);

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !activeId || sending) return;

    const text = inputText.trim();
    setInputText("");

    // ✅ Optimistic update — append immediately so UI feels instant
    const optimisticMsg: ChatMessage = {
      id:        `local-${Date.now()}`,
      type:      "text",
      direction: "sent",
      text,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", hour12: true,
      }),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      setSending(true);
      // ✅ sendChatMessage must accept conversationId + text
      const saved = (await sendChatMessage(activeId, text)) as Record<string, unknown> | null;

      if (saved) {
        const recruiterId = recruiterProfile?.id ?? "";
        const confirmedMsg = normalizeMessage(saved, recruiterId);
        // ✅ Replace optimistic entry with server-confirmed message
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? confirmedMsg : m))
        );
      }

      // ✅ Update last_message in the conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, last_message: text, last_message_at: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      console.error("❌ Failed to send message:", err);
      // ✅ Remove optimistic message on failure so user knows it didn't send
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setInputText(text); // ✅ Restore input so user can retry
    } finally {
      setSending(false);
    }
  }, [inputText, activeId, sending, recruiterProfile?.id]);

  // ── Start new chat ───────────────────────────────────────────────────────
  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId.trim()) return;
    setCreatingChat(true);
    try {
      const conv = (await createOrGetChatConversation(candidateId.trim())) as Conversation;
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conv.id);
        if (exists) return prev;
        return [conv, ...prev];
      });
      setActiveId(conv.id);
      setShowNewChat(false);
      setCandidateId("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to start conversation.");
    } finally {
      setCreatingChat(false);
    }
  };

  const activeConvo = conversations.find((c) => c.id === activeId);
  const activeName  = activeConvo ? getCandidateName(activeConvo) : "";
  const filtered    = conversations.filter((c) =>
    getCandidateName(c).toLowerCase().includes(search.toLowerCase())
  );

  // ── Loading screen ───────────────────────────────────────────────────────
  if (loadingList) {
    return (
      <div className="h-full overflow-hidden flex flex-col">
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

  // ── Main layout ──────────────────────────────────────────────────────────
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Navbar />

      <div className="flex flex-1 bg-[#F5F2EE] overflow-hidden min-h-0">

        {/* ══ LEFT PANEL ══════════════════════════════════════════════════ */}
        <div className="w-[300px] flex-shrink-0 bg-white flex flex-col border-r border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <button
              type="button"
              className="flex items-center gap-1.5 font-bold text-gray-900 text-sm hover:text-[#F4781B] transition-colors"
            >
              All Messages
              <ChevronDown size={15} />
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowNewChat(!showNewChat)}
                className="w-7 h-7 rounded-full bg-[#F4781B] text-white flex items-center justify-center text-lg font-light hover:bg-[#d5650e] transition-colors"
                title="Start new chat"
              >
                {showNewChat ? <X size={14} /> : "+"}
              </button>
              <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search or start a new chat"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs text-gray-600 placeholder-gray-400 outline-none w-full"
              />
            </div>
          </div>

          {/* New chat form */}
          {showNewChat && (
            <form onSubmit={handleStartChat} className="px-4 pb-3 flex gap-2 flex-shrink-0">
              <input
                type="text"
                placeholder="Paste Candidate ID..."
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                className="flex-1 px-3 py-2 bg-white rounded-xl text-xs outline-none border border-gray-200 focus:border-[#F4781B] transition-colors"
              />
              <button
                type="submit"
                disabled={creatingChat || !candidateId.trim()}
                className="px-3 py-2 bg-[#F4781B] text-white text-xs font-medium rounded-xl disabled:opacity-40 hover:bg-[#d5650e] transition-colors"
              >
                {creatingChat ? "…" : "Go"}
              </button>
            </form>
          )}

          {/* API error banner */}
          {listError && (
            <div className="mx-4 mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex-shrink-0">
              {listError}
            </div>
          )}

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {filtered.length === 0
              ? <EmptyConversations />
              : filtered.map((conv) => {
                  const name     = getCandidateName(conv);
                  const isActive = conv.id === activeId;
                  const color    = getAvatarColor(conv.id);
                  return (
                    <div
                      key={conv.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveId(conv.id)}
                      onKeyDown={(e) => e.key === "Enter" && setActiveId(conv.id)}
                      className={`w-full text-left px-4 py-3.5 flex items-start gap-3
                        border-b border-gray-50 transition-colors relative group cursor-pointer
                        ${isActive
                          ? "bg-orange-50 border-l-[3px] border-l-[#F4781B]"
                          : "hover:bg-gray-50 border-l-[3px] border-l-transparent"
                        }`}
                    >
                      <div className={`w-11 h-11 rounded-full ${color} flex items-center justify-center font-semibold text-sm flex-shrink-0`}>
                        {getInitials(name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                          <button
                            type="button"
                            onClick={(e) => toggleStar(conv.id, e)}
                            className="flex-shrink-0 mt-0.5 p-0.5"
                          >
                            <Star
                              size={13}
                              className={conv.starred
                                ? "fill-[#F4781B] text-[#F4781B]"
                                : "text-gray-300 group-hover:text-gray-400 transition-colors"
                              }
                            />
                          </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {conv.last_message ?? "No messages yet"}
                        </p>

                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {formatDateLabel(conv.last_message_at)} | {formatTime(conv.last_message_at)}
                          </p>
                          {conv.recruiter_unread_count > 0 && (
                            <span className="min-w-[18px] h-[18px] px-1 bg-[#F4781B] text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                              {conv.recruiter_unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>

        {/* ══ RIGHT PANEL ═════════════════════════════════════════════════ */}
        {activeConvo ? (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">

            {/* Chat Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${getAvatarColor(activeConvo.id)} flex items-center justify-center font-semibold text-sm`}>
                  {getInitials(activeName)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{activeName}</p>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <button
                  type="button"
                  onClick={(e) => toggleStar(activeConvo.id, e)}
                  className="hover:text-[#F4781B] transition-colors p-1"
                >
                  <Star size={18} className={activeConvo.starred ? "fill-[#F4781B] text-[#F4781B]" : ""} />
                </button>
                <button type="button" className="hover:text-[#F4781B] transition-colors p-1">
                  <Search size={18} />
                </button>
                <button type="button" className="hover:text-[#F4781B] transition-colors p-1">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Messages area */}
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
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1 ${msg.direction === "sent" ? "items-end" : "items-start"}`}
                    >
                      {msg.type === "voice" ? (
                        <VoiceMessage duration={msg.duration ?? "0:00"} />
                      ) : (
                        <div
                          className={`max-w-[52%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line rounded-2xl
                            ${msg.direction === "sent"
                              ? "bg-[#F4781B] text-white rounded-br-sm"
                              : "bg-[#FDEBD0] text-gray-800 rounded-bl-sm"
                            }`}
                        >
                          {msg.text}
                        </div>
                      )}
                      <span className="text-[10px] text-gray-400">{msg.time}</span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Bar */}
            <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <button type="button" className="text-gray-400 hover:text-[#F4781B] transition-colors p-1">
                <Smile size={20} />
              </button>

              <input
                type="text"
                placeholder="Type your message here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none border border-gray-200 focus:border-[#F4781B] transition-colors"
              />

              <button type="button" className="text-gray-400 hover:text-[#F4781B] transition-colors p-1">
                <Plus size={20} />
              </button>
              <button type="button" className="text-gray-400 hover:text-[#F4781B] transition-colors p-1">
                <Mic size={20} />
              </button>

              {inputText.trim() ? (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  className="w-9 h-9 bg-[#F4781B] rounded-full flex items-center justify-center hover:bg-[#d5650e] transition-colors disabled:opacity-50"
                >
                  <Send size={16} className="text-white" />
                </button>
              ) : (
                <button type="button" className="text-gray-400 hover:text-[#F4781B] transition-colors p-1">
                  <ThumbsUp size={20} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="font-semibold text-gray-700">Select a conversation</p>
            <p className="text-sm text-gray-400">Choose a chat from the left to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}