import { Search } from "lucide-react";

export const EmptyConversations = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <Search className="w-5 h-5 text-gray-300" />
    </div>
    <p className="text-sm font-medium text-gray-600">No conversations</p>
    <p className="text-xs text-gray-400 mt-1">Use + to start a new chat</p>
  </div>
);

export const EmptyMessages = () => (
  <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </div>
    <p className="text-sm text-gray-500">No messages yet. Say hello!</p>
  </div>
);

export const EmptySelection = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F4781B" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </div>
    <p className="font-semibold text-gray-700">Select a conversation</p>
    <p className="text-sm text-gray-400">Choose a chat from the left to start messaging</p>
  </div>
);