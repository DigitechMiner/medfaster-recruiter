import { Search, MoreVertical, ChevronDown, X } from "lucide-react";
import { Conversation, getCandidateName } from "./types";
import { ConversationItem } from "./ConversationItem";
import { EmptyConversations } from "./EmptyState";


interface Props {
  conversations: Conversation[];
  activeId: string | null;
  listError: string | null;
  search: string;
  showNewChat: boolean;
  candidateId: string;
  creatingChat: boolean;
  onSearch: (v: string) => void;
  onSelect: (id: string) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onToggleNewChat: () => void;
  onCandidateIdChange: (v: string) => void;
  onStartChat: (e: React.FormEvent) => void;
}

export const ConversationList = ({
  conversations, activeId, listError, search, showNewChat,
  candidateId, creatingChat, onSearch, onSelect, onToggleStar,
  onToggleNewChat, onCandidateIdChange, onStartChat,
}: Props) => {
  const filtered = conversations.filter((c) =>
    getCandidateName(c).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-[300px] flex-shrink-0 bg-white flex flex-col border-r border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <button type="button" className="flex items-center gap-1.5 font-bold text-gray-900 text-sm hover:text-[#F4781B] transition-colors">
          All Messages <ChevronDown size={15} />
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleNewChat}
            className="w-7 h-7 rounded-full bg-[#F4781B] text-white flex items-center justify-center text-lg font-light hover:bg-[#d5650e] transition-colors"
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
            onChange={(e) => onSearch(e.target.value)}
            className="bg-transparent text-xs text-gray-600 placeholder-gray-400 outline-none w-full"
          />
        </div>
      </div>

      {/* New chat form */}
      {showNewChat && (
        <form onSubmit={onStartChat} className="px-4 pb-3 flex gap-2 flex-shrink-0">
          <input
            type="text"
            placeholder="Paste Candidate ID..."
            value={candidateId}
            onChange={(e) => onCandidateIdChange(e.target.value)}
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

      {/* Error */}
      {listError && (
        <div className="mx-4 mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex-shrink-0">
          {listError}
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filtered.length === 0
          ? <EmptyConversations />
          : filtered.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeId}
                onSelect={onSelect}
                onToggleStar={onToggleStar}
              />
            ))
        }
      </div>
    </div>
  );
};