import { Search, Star, MoreVertical } from "lucide-react";
import { Conversation, getAvatarColor, getCandidateName, getInitials } from "./types";

interface Props {
  convo: Conversation;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
}

export const ChatHeader = ({ convo, onToggleStar }: Props) => {
  const name = getCandidateName(convo);
  return (
    <div className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${getAvatarColor(convo.id)} flex items-center justify-center font-semibold text-sm`}>
          {getInitials(name)}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{name}</p>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <button type="button" onClick={(e) => onToggleStar(convo.id, e)} className="hover:text-[#F4781B] transition-colors p-1">
          <Star size={18} className={convo.starred ? "fill-[#F4781B] text-[#F4781B]" : ""} />
        </button>
        <button type="button" className="hover:text-[#F4781B] transition-colors p-1">
          <Search size={18} />
        </button>
        <button type="button" className="hover:text-[#F4781B] transition-colors p-1">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
};