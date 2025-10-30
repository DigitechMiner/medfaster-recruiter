"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
          {topic.title}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddQuestion}
          className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Add Question
        </Button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {topic.questions.map((question, index) => (
          <div key={question.id} className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Question {index + 1}
              </label>
              <button
                type="button"
                onClick={() => onRemoveQuestion(question.id)}
                className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                aria-label="Delete question"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
            <Textarea
              value={question.text}
              onChange={(e) => onUpdateQuestion(question.id, e.target.value)}
              placeholder="Enter question text..."
              className="w-full min-h-[60px] sm:min-h-[70px] resize-none text-xs sm:text-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500"
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}


