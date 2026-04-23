"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Paperclip, Send } from "lucide-react";
import {
  fetchChatMessages,
  sendChatMessage,
  editChatMessage,
  deleteChatMessage,
} from "@/stores/api/chat-api";
import {
  getRecruiterChatSocket,
  initRecruiterChatSocket,
} from "@/lib/chatSocket";
import { Navbar } from "@/components/global/navbar";

interface Message {
  id: string;
  conversation_id: string;
  sender_type: "candidate" | "recruiter";
  sender_id: string;
  message: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export default function RecruiterConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params?.conversationId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!conversationId) return;
    let mounted = true;
    let socketCleanup: (() => void) | undefined;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchChatMessages(conversationId) as { messages: Message[] };
        if (mounted) setMessages(data.messages || []);
      } catch (err: unknown) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    async function setupSocket() {
      try {
        let socket = getRecruiterChatSocket();
        if (!socket?.connected) socket = await initRecruiterChatSocket();
        if (!socket) return;

        socket.emit("join_conversation", conversationId);

        const onReceived = (msg: Message) => {
          if (msg.conversation_id === conversationId) {
            setMessages((prev) =>
              prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
            );
          }
        };

        const onUpdated = (msg: Message) => {
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
        };

        const onDeleted = (payload: { messageId: string; conversationId: string }) => {
          if (payload.conversationId === conversationId) {
            setMessages((prev) =>
              prev.map((m) => m.id === payload.messageId ? { ...m, is_deleted: true } : m)
            );
          }
        };

        socket.on("message_received", onReceived);
        socket.on("message_updated", onUpdated);
        socket.on("message_deleted", onDeleted);

        // ✅ Store cleanup so useEffect return can call it
        socketCleanup = () => {
          socket.emit("leave_conversation", conversationId);
          socket.off("message_received", onReceived);
          socket.off("message_updated", onUpdated);
          socket.off("message_deleted", onDeleted);
        };
      } catch (err) {
        console.error("Socket setup error:", err);
      }
    }

    load();
    setupSocket();

    return () => {
      mounted = false;
      socketCleanup?.(); // ✅ properly cleans up listeners on unmount
    };
  }, [conversationId]);

  const handleSend = async () => {
    if (!conversationId || sending) return;
    const text = editingId ? editingText : input;
    if (!text.trim()) return;
    const trimmed = text.trim();

    if (editingId) {
      try {
        await editChatMessage(editingId, trimmed);
        setEditingId(null);
        setEditingText("");
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to edit message");
      }
      return;
    }

    setInput("");
    setSending(true);
    try {
      await sendChatMessage(conversationId, trimmed);
    } catch (err: unknown) {
      setInput(trimmed);
      alert(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const startEdit = (msg: Message) => {
    if (msg.is_deleted) return;
    setEditingId(msg.id);
    setEditingText(msg.message);
  };

  const cancelEdit = () => { setEditingId(null); setEditingText(""); };

  const handleDelete = async (messageId: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteChatMessage(messageId);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete message");
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "short", day: "numeric",
    });
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "short", day: "numeric",
    });
    const label = date === today ? "Today" : date;
    const existing = acc.find((g) => g.date === label);
    if (existing) existing.msgs.push(msg);
    else acc.push({ date: label, msgs: [msg] });
    return acc;
  }, []);

  const currentText = editingId ? editingText : input;

  if (!conversationId) {
    return (
      <div className="flex flex-col h-full">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-[#F5F5F5]">
          <div className="text-center">
            <p className="text-gray-500">No conversation selected</p>
            <button
              onClick={() => router.push("/messages")}
              className="mt-4 px-4 py-2 bg-[#F4781B] text-white rounded-xl text-sm"
            >
              Back to Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-[#F5F5F5]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F4781B]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 bg-[#F5F5F5]">
          <div className="bg-white rounded-2xl p-6 shadow text-center max-w-sm">
            <p className="font-semibold text-gray-800">Error</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
            <button
              onClick={() => router.push("/messages")}
              className="mt-4 px-4 py-2 bg-[#F4781B] text-white rounded-xl text-sm"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex flex-col bg-[#F5F5F5] flex-1 overflow-hidden">

        {/* Chat Header */}
        <div className="bg-[#F5F5F5] px-5 pt-5 pb-4 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => router.push("/messages")}
            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h2 className="flex-1 text-center font-bold text-lg text-gray-900 -ml-8">
            Conversation
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm text-center">
                No messages yet.<br />Start the conversation!
              </p>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex justify-center my-4">
                  <span className="bg-white text-gray-400 text-xs px-4 py-1.5 rounded-full shadow-sm">
                    {group.date}
                  </span>
                </div>

                {group.msgs.map((m) => {
                  const isOutgoing = m.sender_type === "recruiter";
                  return (
                    <div
                      key={m.id}
                      className={`flex w-full mb-2 ${isOutgoing ? "justify-end" : "justify-start"} items-end gap-2`}
                    >
                      {!isOutgoing && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-gray-600 mb-1">
                          C
                        </div>
                      )}

                      <div className="relative max-w-[72%]">
                        {isOutgoing && !m.is_deleted && (
                          <div className="flex justify-end gap-2 mb-1">
                            <button onClick={() => startEdit(m)} className="text-[10px] text-gray-400 hover:text-gray-600">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(m.id)} className="text-[10px] text-gray-400 hover:text-red-500">
                              Delete
                            </button>
                          </div>
                        )}

                        <div
                          className={`px-4 py-3 text-sm leading-relaxed shadow-sm
                            ${isOutgoing
                              ? "bg-[#FDEEDE] text-gray-900 rounded-2xl rounded-br-sm"
                              : "bg-white text-gray-900 rounded-2xl rounded-bl-sm"
                            }
                            ${m.is_deleted ? "opacity-50" : ""}
                          `}
                        >
                          {m.is_deleted ? (
                            <span className="italic text-xs text-gray-400">Message deleted</span>
                          ) : (
                            <p className="whitespace-pre-wrap break-words">{m.message}</p>
                          )}
                        </div>

                        {!m.is_deleted && (
                          <div className={`flex mt-1 ${isOutgoing ? "justify-end" : "justify-start"}`}>
                            <span className="text-[10px] text-gray-400">{formatTime(m.created_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-6 pt-3 flex items-center gap-3 flex-shrink-0">
          <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
            <Paperclip className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={currentText}
              onChange={(e) => editingId ? setEditingText(e.target.value) : setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && editingId) cancelEdit();
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder={editingId ? "Edit message..." : "Type Here"}
              className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
              disabled={sending}
              maxLength={1000}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !currentText.trim()}
            className="w-12 h-12 bg-[#F4781B] rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#d5650e] transition-colors shadow-md"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>

        {editingId && (
          <div className="px-4 pb-3 text-center text-xs text-gray-400 flex-shrink-0">
            Editing message •{" "}
            <button onClick={cancelEdit} className="underline text-[#F4781B]">Cancel</button>
          </div>
        )}

      </div>
    </div>
  );
}