"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollFadeContainer } from "@/components/ui/scroll-fade-container";
import { useJobQuestions } from "@/hooks/useJobData";
import { EmptyState, LoadingRows } from "../shared/JobDetailDataView";

type InterviewQuestionsDialogProps = {
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InterviewQuestionsDialog({
  jobId,
  open,
  onOpenChange,
}: InterviewQuestionsDialogProps) {
  const { questions, isLoading, error } = useJobQuestions(jobId, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[10vh] flex max-h-[82vh] w-[calc(100%-2rem)] max-w-2xl translate-y-0 flex-col gap-4 overflow-hidden p-6 pb-0 sm:max-w-2xl sm:rounded-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="pr-8 text-left text-lg font-bold text-gray-900">
            AI Interview Questions
          </DialogTitle>
          <DialogDescription className="text-left text-sm text-gray-500">
            Questions candidates will be asked during the AI interview
          </DialogDescription>
        </DialogHeader>
        <ScrollFadeContainer
          watchKey={`${open}-${questions.length}-${isLoading}`}
          edgeBleed
          className="max-h-[calc(82vh-7.5rem)]"
        >
          {isLoading ? (
            <LoadingRows count={4} />
          ) : error ? (
            <EmptyState
              title="Unable to load interview questions"
              description={error}
            />
          ) : questions.length === 0 ? (
            <EmptyState
              title="No interview questions"
              description="This job does not have stored AI interview questions yet."
            />
          ) : (
            <ol className="flex flex-col gap-3 pb-2">
              {questions.map((question, index) => (
                <li
                  key={`${index}-${question}`}
                  className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-semibold text-[#F4781B]">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-6 text-gray-700">
                    {question}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </ScrollFadeContainer>
      </DialogContent>
    </Dialog>
  );
}
