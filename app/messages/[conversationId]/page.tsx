"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchChatMessages, sendChatMessage } from "@/stores/api/chat-api";
import { getRecruiterChatSocket } from "@/lib/chatSocket";

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'candidate' | 'recruiter';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!conversationId) return;
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchChatMessages(conversationId);
        if (!mounted) return;
        setMessages(data.messages || []);
        console.log('📥 Loaded', data.messages?.length || 0, 'messages');
      } catch (err: any) {
        console.error("Failed to load messages:", err);
        if (mounted) {
          setError(err?.message || 'Failed to load messages');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    const socket = getRecruiterChatSocket();
    if (socket) {
      socket.emit("join_conversation", conversationId);
      console.log('🔌 Emitted join_conversation:', conversationId);

      const onReceived = (msg: Message) => {
        console.log('🔥 [RECRUITER] message_received:', {
          id: msg.id?.slice(0, 8),
          conversation_id: msg.conversation_id,
          sender_type: msg.sender_type,
          message: msg.message.slice(0, 30),
        });
        
        if (msg.conversation_id === conversationId) {
          setMessages(prev => {
            // Prevent duplicates
            if (prev.some(m => m.id === msg.id)) {
              console.log('⚠️ Duplicate message detected, skipping');
              return prev;
            }
            return [...prev, msg];
          });
        } else {
          console.warn('❌ Message conversation mismatch:', {
            expected: conversationId,
            received: msg.conversation_id
          });
        }
      };

      const onUpdated = (msg: Message) => {
        console.log('✏️ [RECRUITER] message_updated:', msg.id?.slice(0, 8));
        setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, ...msg } : m)));
      };

      const onDeleted = (payload: { messageId: string; conversationId: string }) => {
        console.log('🗑️ [RECRUITER] message_deleted:', payload.messageId?.slice(0, 8));
        if (payload.conversationId === conversationId) {
          setMessages(prev =>
            prev.map(m => (m.id === payload.messageId ? { ...m, is_deleted: true } : m)),
          );
        }
      };

      socket.on("message_received", onReceived);
      socket.on("message_updated", onUpdated);
      socket.on("message_deleted", onDeleted);

      return () => {
        mounted = false;
        if (socket) {
          socket.emit("leave_conversation", conversationId);
          socket.off("message_received", onReceived);
          socket.off("message_updated", onUpdated);
          socket.off("message_deleted", onDeleted);
          console.log('🔌 Left conversation:', conversationId);
        }
      };
    } else {
      console.warn('⚠️ Socket unavailable - real-time updates disabled');
    }

    return () => {
      mounted = false;
    };
  }, [conversationId]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId || sending) return;

    const messageContent = input.trim();
    setInput("");
    setSending(true);

    try {
      await sendChatMessage(conversationId, messageContent);
      console.log('📤 Message sent, waiting for socket event...');
    } catch (err: any) {
      console.error("Send failed:", err);
      setInput(messageContent);
      alert(err?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No conversation selected</p>
          <button
            onClick={() => router.push('/messages')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="font-semibold text-red-800">Error loading conversation</p>
          <p className="text-sm text-red-600 mt-2">{error}</p>
          <button
            onClick={() => router.push('/messages')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/messages')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="font-semibold text-gray-900">Conversation</h2>
            <p className="text-xs text-gray-500">{messages.length} messages</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              No messages yet.<br />
              <span className="text-sm">Start the conversation!</span>
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isOutgoing = m.sender_type === "recruiter";
            return (
              <div key={m.id} className="flex w-full">
                <div
                  className={`
                    max-w-[75%] rounded-2xl px-4 py-3 shadow-sm
                    ${isOutgoing
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white ml-auto rounded-br-sm"
                      : "bg-white text-gray-900 mr-auto rounded-bl-sm border border-gray-200"
                    }
                    ${m.is_deleted ? "opacity-60" : ""}
                  `}
                >
                  <div className="whitespace-pre-wrap break-words text-sm">
                    {m.is_deleted ? (
                      <span className="italic text-xs opacity-75">Message deleted</span>
                    ) : (
                      m.message
                    )}
                  </div>
                  <div className={`text-xs mt-1 ${isOutgoing ? 'text-green-100' : 'text-gray-500'}`}>
                    {new Date(m.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t shadow-lg p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sending}
            maxLength={1000}
          />
          <button
            className={`
              rounded-xl px-6 py-3 font-medium transition-all shadow-lg
              ${sending || !input.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:-translate-y-0.5"
              }
            `}
            onClick={handleSend}
            disabled={sending || !input.trim()}
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending
              </span>
            ) : (
              "Send"
            )}
          </button>
        </div>
        <div className="text-xs text-gray-500 text-center mt-2">
          {input.length}/1000 characters
        </div>
      </div>
    </div>
  );
}
