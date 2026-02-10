"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchChatConversations, createOrGetChatConversation } from "@/stores/api/chat-api";
import { initRecruiterChatSocket } from "@/lib/chatSocket";
import { useAuthStore } from "@/stores/authStore";

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
  
  // New chat form state
  const [candidateId, setCandidateId] = useState('');
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const socket = await initRecruiterChatSocket();
        if (socket) {
          console.log('✅ Recruiter socket ready for chat');
        } else {
          console.warn('⚠️ Socket initialization failed');
        }
      } catch (err) {
        console.error('❌ Socket init error:', err);
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
        
        // Load profile if not loaded
        if (!recruiterProfile) {
          await loadRecruiterProfile();
        }
        
        // Load conversations
        const data = await fetchChatConversations();
        if (mounted) {
          setConversations(data || []);
        }
      } catch (err: unknown) {
        console.error('Failed to load conversations:', err);
        if (mounted) {
          // Type guard for error message
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Failed to load conversations';
          setError(errorMessage);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [recruiterProfile, loadRecruiterProfile]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId.trim()) return;

    setCreatingChat(true);
    try {
      const conversation = await createOrGetChatConversation(candidateId.trim());
      router.push(`/messages/${conversation.id}`);
    } catch (err: unknown) {
      console.error('Failed to create conversation:', err);
      // Type guard for error message
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to start conversation. Please check the Candidate ID.';
      alert(errorMessage);
    } finally {
      setCreatingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-semibold">Error loading conversations</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const getCandidateName = (conv: Conversation) => {
    if (conv.candidate?.first_name || conv.candidate?.last_name) {
      return `${conv.candidate.first_name || ''} ${conv.candidate.last_name || ''}`.trim();
    }
    return conv.candidate?.email || 'Candidate';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-600 mt-1">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Display Current User ID */}
      {recruiterProfile && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">
            <strong>Your Recruiter ID:</strong> 
            <code className="ml-2 px-2 py-1 bg-white rounded text-xs font-mono select-all">
              {recruiterProfile.id}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(recruiterProfile.id)}
              className="ml-2 text-xs text-green-600 hover:text-green-800"
            >
              📋 Copy
            </button>
          </p>
        </div>
      )}

      {/* Start New Chat Section */}
      <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Start New Conversation</h2>
        <form onSubmit={handleStartChat} className="flex gap-3">
          <input
            type="text"
            placeholder="Enter Candidate ID (e.g., c1d8e4fe-b346-41f1-9409-c7825cbc56b2)"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
          />
          <button
            type="submit"
            disabled={creatingChat || !candidateId.trim()}
            className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {creatingChat ? 'Creating...' : 'Start Chat'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">💡 Paste a candidate ID to start chatting with them</p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No conversations yet</h3>
          <p className="mt-2 text-sm text-gray-500">Start messaging with candidates to see your conversations here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="block rounded-xl border-2 border-gray-200 bg-white p-4 hover:border-green-500 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {getCandidateName(conv)}
                    </h3>
                    {conv.recruiter_unread_count > 0 && (
                      <span className="flex-shrink-0 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                        {conv.recruiter_unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {conv.last_message || <span className="italic text-gray-400">No messages yet</span>}
                  </p>
                  {conv.last_message_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conv.last_message_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <svg className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
