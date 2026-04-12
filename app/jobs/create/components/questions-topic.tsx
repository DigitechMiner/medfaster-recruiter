"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Question {
  id: string;
  text: string;
}

interface Topic {
  id: string;
  title: string;
  questions: Question[];
}

interface QuestionsTopicProps {
  topic: Topic;
  onAddQuestion: () => void;
  onRemoveQuestion: (questionId: string) => void;
  onUpdateQuestion: (questionId: string, text: string) => void;
}

export function QuestionsTopic({
  topic,
  onAddQuestion,
  onRemoveQuestion,
  onUpdateQuestion,
}: QuestionsTopicProps) {
  return (
    <div className="space-y-4 w-full">
      {topic.questions.map((question, index) => (
        <div key={question.id} className="flex items-center gap-4">
          {/* Label outside input */}
          <span className="text-sm font-semibold text-gray-800 whitespace-nowrap min-w-[100px]">
            Questions {index + 1} )
          </span>

          {/* Single line input */}
          <Input
            value={question.text}
            onChange={(e) => onUpdateQuestion(question.id, e.target.value)}
            placeholder="Lorem ipsum dolor sit amet consectetur Non commodo tellus non enim sit?"
            className="flex-1 h-11 border-gray-200 focus:border-[#F4781B] focus:ring-[#F4781B] rounded-xl"
          />

          {/* Edit icon — green */}
          <button
            type="button"
            className="text-green-500 hover:text-green-600 p-1 hover:bg-green-50 rounded transition-colors flex-shrink-0"
            aria-label="Edit question"
          >
            <Pencil className="w-5 h-5" />
          </button>

          {/* Delete icon — red */}
          <button
            type="button"
            onClick={() => onRemoveQuestion(question.id)}
            className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"
            aria-label="Delete question"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}