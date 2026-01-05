import { useState, useCallback } from 'react';
import { Topic } from '@/app/jobs/constants/form';

export function useQuestions(initialTopics: Topic[]) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);

  const addQuestion = useCallback((topicId: string) => {
    setTopics((prevTopics) =>
      prevTopics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              questions: [
                ...topic.questions,
                {
                  id: `${topicId}-${topic.questions.length + 1}`,
                  text: "",
                },
              ],
            }
          : topic
      )
    );
  }, []);

  const removeQuestion = useCallback((topicId: string, questionId: string) => {
    setTopics((prevTopics) =>
      prevTopics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              questions: topic.questions.filter((q) => q.id !== questionId),
            }
          : topic
      )
    );
  }, []);

  const updateQuestion = useCallback((topicId: string, questionId: string, text: string) => {
    setTopics((prevTopics) =>
      prevTopics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              questions: topic.questions.map((q) =>
                q.id === questionId ? { ...q, text } : q
              ),
            }
          : topic
      )
    );
  }, []);

  return { topics, setTopics, addQuestion, removeQuestion, updateQuestion };
}

