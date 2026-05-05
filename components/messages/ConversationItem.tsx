import { Star } from "lucide-react";
import { Conversation, getAvatarColor, getCandidateName, getInitials, formatTime, formatDateLabel } from "./types";

interface Props {
  conv: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
}

export const ConversationItem = ({ conv, isActive, onSelect, onToggleStar }: Props) => {
  const name  = getCandidateName(conv);
  const color = getAvatarColor(conv.id);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(conv.id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(conv.id)}
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
          <button type="button" onClick={(e) => onToggleStar(conv.id, e)} className="flex-shrink-0 mt-0.5 p-0.5">
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
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
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
};