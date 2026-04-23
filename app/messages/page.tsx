"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { fetchChatConversations, createOrGetChatConversation } from "@/stores/api/chat-api";
import { initRecruiterChatSocket } from "@/lib/chatSocket";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/global/navbar";

interface Conversation {
  id: string;
  recruiter_id: string;
  candidate_id: string;
  last_message: string | null;
  last_message_at: string | null;
  recruiter_unread_count: number;
  candidate?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const { recruiterProfile, loadRecruiterProfile } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [creatingChat, setCreatingChat] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const socket = await initRecruiterChatSocket();
        if (!socket) console.warn("⚠️ Socket initialization failed");
      } catch (err) {
        console.error("❌ Socket init error:", err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        if (!recruiterProfile) await loadRecruiterProfile();
        const data = await fetchChatConversations();
        if (mounted) setConversations((data as Conversation[]) || []);
      } catch (err: unknown) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load conversations");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recruiterProfile]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId.trim()) return;
    setCreatingChat(true);
    try {
      const conversation = await createOrGetChatConversation(candidateId.trim()) as { id: string };
      router.push(`/messages/${conversation.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to start conversation.");
    } finally {
      setCreatingChat(false);
    }
  };

  const getCandidateName = (conv: Conversation) => {
    if (conv.candidate?.first_name || conv.candidate?.last_name) {
      return `${conv.candidate.first_name || ""} ${conv.candidate.last_name || ""}`.trim();
    }
    return conv.candidate?.email || "Candidate";
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const filtered = conversations.filter((conv) =>
    getCandidateName(conv).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center bg-[#F5F5F5]" style={{ height: "calc(100vh - 56px)" }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F4781B] mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading conversations...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center p-4 bg-[#F5F5F5]" style={{ height: "calc(100vh - 56px)" }}>
          <div className="bg-white rounded-2xl p-6 shadow text-center max-w-sm">
            <p className="font-semibold text-gray-800">Failed to load</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col bg-[#F5F5F5]" style={{ height: "calc(100vh - 56px)" }}>
        {/* Header */}
        <div className="bg-[#F5F5F5] px-5 pt-6 pb-3">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="w-9 h-9 rounded-full bg-[#F4781B] text-white flex items-center justify-center text-xl font-light hover:bg-[#d5650e] transition-colors"
            >
              +
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search here..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 outline-none shadow-sm"
            />
          </div>

          {/* New chat form (collapsible) */}
          {showNewChat && (
            <form onSubmit={handleStartChat} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Paste Candidate ID..."
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white rounded-xl text-sm outline-none shadow-sm border border-gray-200 focus:border-[#F4781B]"
              />
              <button
                type="submit"
                disabled={creatingChat || !candidateId.trim()}
                className="px-4 py-2.5 bg-[#F4781B] text-white text-sm font-medium rounded-xl disabled:opacity-40 hover:bg-[#d5650e] transition-colors"
              >
                {creatingChat ? "..." : "Go"}
              </button>
            </form>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto bg-white rounded-t-3xl mt-2 shadow-sm">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-gray-300" />
              </div>
              <p className="font-medium text-gray-700">No conversations found</p>
              <p className="text-sm text-gray-400 mt-1">Start a new chat using the + button</p>
            </div>
          ) : (
            filtered.map((conv) => {
              const name = getCandidateName(conv);
              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-base overflow-hidden">
                      {getInitials(name)}
                    </div>
                    <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0 border-b border-gray-100 pb-4">
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-gray-900 text-base truncate">{name}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <p className="text-sm text-gray-400 truncate">
                        {conv.last_message || "No messages yet"}
                      </p>
                      {conv.recruiter_unread_count > 0 && (
                        <span className="ml-2 flex-shrink-0 min-w-[22px] h-[22px] px-1.5 bg-[#F4781B] text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {conv.recruiter_unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}