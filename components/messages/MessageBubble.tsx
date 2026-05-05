import { useState } from "react";
import { MoreVertical, Play } from "lucide-react";
import { ChatMessage } from "./types";

interface Props {
  msg: ChatMessage;
  onEdit: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const VoiceMessage = ({ duration }: { duration: string }) => {
  const bars = [3,5,8,12,16,10,14,18,12,8,15,20,14,10,6,12,18,14,8,5,10,16,12,8,4];
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-[#FDEBD0] rounded-2xl rounded-bl-sm w-64">
      <button type="button" className="w-8 h-8 bg-[#F4781B] rounded-full flex items-center justify-center hover:bg-[#e06510] transition-colors flex-shrink-0">
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

export const MessageBubble = ({ msg, onEdit, onDelete }: Props) => {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [editing, setEditing]       = useState(false);
  const [editText, setEditText]     = useState("");

  const isSent = msg.direction === "sent";

  const startEdit = () => {
    setEditText(msg.text ?? "");
    setEditing(true);
    setMenuOpen(false);
  };

  const saveEdit = async () => {
    if (editText.trim()) await onEdit(msg.id, editText.trim());
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditText("");
  };

  return (
    <div className={`flex flex-col gap-1 ${isSent ? "items-end" : "items-start"}`}>
      {/*
        ✅ FIX: group wraps BOTH the bubble and the 3-dot menu.
        Hovering the menu keeps the group hovered → dots stay visible.
      */}
      <div className={`relative flex items-center gap-1 group ${isSent ? "flex-row-reverse" : "flex-row"}`}>

        {/* Bubble / edit input */}
        {editing ? (
          <div className="flex items-center gap-2" style={{ minWidth: "260px", maxWidth: "52vw" }}>
            <input
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-[#F4781B] outline-none bg-white text-gray-800"
            />
            <button
              type="button"
              onClick={saveEdit}
              className="text-xs px-2.5 py-1.5 bg-[#F4781B] text-white rounded-lg hover:bg-[#d5650e] transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs px-2.5 py-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : msg.type === "voice" ? (
          <VoiceMessage duration={msg.duration ?? "0:00"} />
        ) : (
          <div
            className={`max-w-[52vw] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line rounded-2xl
              ${isSent
                ? "bg-[#F4781B] text-white rounded-br-sm"
                : "bg-[#FDEBD0] text-gray-800 rounded-bl-sm"
              }`}
          >
            {msg.text}
          </div>
        )}

        {/* 3-dot menu — only on sent, not while editing */}
        {isSent && !editing && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <MoreVertical size={14} />
            </button>

            {menuOpen && (
              <>
                {/* Invisible backdrop to catch outside clicks */}
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute bottom-8 right-0 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20 min-w-[110px]">
                  <button
                    type="button"
                    onClick={startEdit}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => { await onDelete(msg.id); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <span className="text-[10px] text-gray-400">{msg.time}</span>
    </div>
  );
};