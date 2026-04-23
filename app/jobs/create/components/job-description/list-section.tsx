"use client";

import { useState } from "react";
import { Check, Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ListSectionProps {
  title: string;
  required?: boolean;
  items: string[];
  onChange: (items: string[]) => void;
}

export function ListSection({
  title,
  required,
  items,
  onChange,
}: ListSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(items[index]);
  };

  const confirmEdit = (index: number) => {
    if (!editValue.trim()) return;
    const next = [...items];
    next[index] = editValue.trim();
    onChange(next);
    setEditingIndex(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    if (editingIndex !== null && items[editingIndex] === "") {
      onChange(items.filter((_, i) => i !== editingIndex));
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const handleAdd = () => {
    const next = [...items, ""];
    onChange(next);
    setEditingIndex(next.length - 1);
    setEditValue("");
  };

  const handleDelete = (index: number) => {
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditValue("");
    }
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          {title}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </h3>
        <Button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-orange-600 text-white text-xs font-semibold px-3 h-8 rounded-md shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add More
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-white group hover:border-gray-300 transition-colors"
          >
            {editingIndex === index ? (
              <>
                <Input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmEdit(index);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="flex-1 h-7 border-none shadow-none p-0 text-sm focus-visible:ring-0"
                  placeholder="Enter text..."
                />
                <button
                  type="button"
                  onClick={() => confirmEdit(index)}
                  className="text-green-500 hover:text-green-600 flex-shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-700 truncate">
                  {item || <span className="text-gray-300 italic">Empty — click edit to fill</span>}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(index)}
                  className="text-[#F4781B] hover:text-orange-600 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-xs text-gray-400 italic px-1">
            No items yet — click &quot;Add More&quot; or generate with AI above.
          </p>
        )}
      </div>
    </div>
  );
}
