"use client";

import { useRef, type ReactNode } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateJobListSectionProps {
  title: string;
  required?: boolean;
  items: string[];
  onChange: (items: string[]) => void;
  error?: string;
  placeholder?: string;
  addLabel?: string;
  maxItems?: number;
  onMaxItemsReached?: () => void;
  counterText?: string;
  headerActions?: ReactNode;
  itemLabel?: (index: number) => ReactNode;
}

export function CreateJobListSection({
  title,
  required,
  items,
  onChange,
  error,
  placeholder = "Lorem ipsum dolor sit amet consectetur adipiscing elit...",
  addLabel = "Add More",
  maxItems,
  onMaxItemsReached,
  counterText,
  headerActions,
  itemLabel,
}: CreateJobListSectionProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const normalized = items.length > 0 ? items : [""];
  const canAdd = !maxItems || normalized.length < maxItems;

  const handleAdd = () => {
    if (!canAdd) {
      onMaxItemsReached?.();
      return;
    }

    onChange([...normalized, ""]);
  };

  const handleUpdate = (index: number, value: string) => {
    const next = [...normalized];
    next[index] = value;
    onChange(next);
  };

  const handleDelete = (index: number) => {
    const next = normalized.filter((_, i) => i !== index);
    onChange(next.length === 0 ? [""] : next);
  };

  const handleEdit = (index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3 gap-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {title}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </h3>
        <div className="flex items-center gap-3">
          {headerActions}
          <Button
            type="button"
            onClick={handleAdd}
            aria-disabled={!canAdd}
            className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-orange-600 text-white text-xs font-semibold px-3 h-8 rounded-md shadow-sm aria-disabled:opacity-40 aria-disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            {addLabel}
          </Button>
        </div>
      </div>

      {counterText && (
        <p className="text-xs text-gray-400 mb-3 text-right">{counterText}</p>
      )}

      <div className="space-y-4 w-full">
        {normalized.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            {itemLabel && (
              <span className="text-sm font-semibold text-gray-900 whitespace-nowrap w-28 flex-shrink-0">
                {itemLabel(index)}
              </span>
            )}
            <Input
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              value={item}
              onChange={(event) => handleUpdate(index, event.target.value)}
              placeholder={placeholder}
              className="flex-1 h-11 border-gray-200 focus:border-[#F4781B] focus:ring-[#F4781B] rounded-xl"
            />
            <button
              type="button"
              onClick={() => handleEdit(index)}
              className="text-green-500 hover:text-green-600 p-1 hover:bg-green-50 rounded transition-colors flex-shrink-0"
              aria-label="Edit item"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(index)}
              className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"
              aria-label="Delete item"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
