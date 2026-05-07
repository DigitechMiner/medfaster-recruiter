"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, FileText, Info, Lock, Mail } from "lucide-react";

import { steps } from "@/components/forms";
import { Button } from "@/components/ui/button";

const stepConfig = [
  { label: steps[0], description: "Enter Organization Details", icon: Info },
  { label: steps[1], description: "Enter Contact Information", icon: Mail },
  { label: steps[2], description: "Submit Required Compliance Proofs", icon: FileText },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return children;
}

interface SidebarProps {
  step: number;
  completedSteps?: Set<number>;
  onStepChange?: (step: number) => void;
}

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
}

interface RegistrationLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function StepNavigation({ currentStep, totalSteps, onPrev, onNext }: StepNavigationProps) {
  return (
    <div className="flex justify-end gap-5 mb-4 sm:mb-6">
      <Button
        type="button"
        variant="ghost"
        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onPrev}
        disabled={currentStep === 0}
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onNext}
        disabled={currentStep === totalSteps - 1}
      >
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
      </Button>
    </div>
  );
}

export function RegistrationLayout({ sidebar, children }: RegistrationLayoutProps) {
  return (
    <div className="fixed inset-0 flex flex-col lg:flex-row bg-[#F8FAFC]">
      {sidebar}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-6 bg-[#F8FAFC] lg:bg-white">
          {children}
        </div>
        <div className="lg:hidden w-full py-3 px-4 flex items-center justify-center gap-2 text-gray-500 text-xs bg-[#F8FAFC] flex-shrink-0">
          <Mail className="w-4 h-4" />
          <a href="mailto:help@KeRaeva.com" className="truncate">
            help@KeRaeva.com
          </a>
        </div>
      </main>
    </div>
  );
}

export function Sidebar({ step, completedSteps = new Set(), onStepChange }: SidebarProps) {
  const progressPercentage = ((step + 1) / stepConfig.length) * 100;

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex flex-col justify-between py-4 sm:py-6 lg:py-8 border-b-0 lg:border-r border-gray-200 lg:min-h-screen bg-[#F8FAFC]">
      <div>
        <div className="px-4 sm:px-6 mb-6 sm:mb-8 lg:mb-12">
          <Image
            src="/img/brand/new_logo.svg"
            alt="KeRaeva"
            width={220}
            height={70}
            className="w-full h-auto max-w-[180px] lg:max-w-[200px] xl:max-w-[220px] object-contain mx-auto lg:mx-0"
            priority
          />
        </div>

        <div className="lg:hidden px-4 sm:px-6">
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full transform -translate-y-1/2">
              <div
                className="h-full bg-[#F4781B] rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="relative flex justify-between items-center py-4">
              {stepConfig.map((s, i) => {
                const Icon = s.icon;
                const isActive = step === i;
                const isCompleted = completedSteps.has(i);
                const isLocked =
                  i > step &&
                  !Array.from({ length: i }, (_, j) => j).every((j) => completedSteps.has(j));

                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => onStepChange?.(i)}
                    disabled={isLocked}
                    className={`relative z-10 flex flex-col items-center transition-opacity ${
                      isLocked ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                    }`}
                  >
                    <div
                      className={`p-2 sm:p-3 rounded-full border-2 transition-all ${
                        isActive
                          ? "border-[#F4781B] bg-white shadow-md scale-110"
                          : isCompleted
                            ? "border-[#F4781B] bg-[#F4781B]"
                            : "border-gray-300 bg-white"
                      }`}
                    >
                      {isCompleted && !isActive ? (
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      ) : (
                        <Icon
                          className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                            isActive ? "text-[#F4781B]" : "text-gray-400"
                          }`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex flex-col gap-2 px-4 relative">
          {stepConfig.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === i;
            const isCompleted = completedSteps.has(i);
            const isLast = i === stepConfig.length - 1;
            const isLocked =
              i > step &&
              !Array.from({ length: i }, (_, j) => j).every((j) => completedSteps.has(j));

            return (
              <div key={s.label} className="relative">
                <button
                  type="button"
                  onClick={() => onStepChange?.(i)}
                  disabled={isLocked}
                  className={`w-full text-left transition-opacity ${
                    isLocked ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                  }`}
                >
                  <div className="flex items-start gap-3 rounded-lg px-4 py-6 transition-colors relative z-10">
                    <div
                      className={`p-2 rounded-md border shadow-sm relative shrink-0 ${
                        isCompleted && !isActive
                          ? "border-[#F4781B] bg-[#FFF3EC]"
                          : "border-[#D9D9E0] bg-white"
                      }`}
                    >
                      {isCompleted && !isActive ? (
                        <Check className="w-6 h-6 text-[#F4781B]" />
                      ) : isLocked ? (
                        <Lock className="w-6 h-6 text-gray-300" />
                      ) : (
                        <div className={isActive ? "opacity-100" : "opacity-60"}>
                          <Icon className="w-6 h-6 text-gray-700" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div
                        className={`font-medium text-sm text-gray-900 ${
                          isActive ? "opacity-100" : "opacity-60"
                        }`}
                      >
                        {s.label}
                      </div>
                      <div
                        className={`text-xs text-gray-400 mt-0.5 ${
                          isActive ? "opacity-100" : "opacity-60"
                        }`}
                      >
                        {isLocked ? "Complete previous step first" : s.description}
                      </div>
                    </div>
                  </div>
                </button>

                {!isLast && (
                  <div className="absolute left-[36px] top-[56px] w-[1px] h-[calc(100%+8px)] bg-[#D9D9E0] z-0 opacity-50" />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="hidden lg:flex px-4 sm:px-6 mt-4 sm:mt-6 lg:mt-8 items-center justify-center lg:justify-start gap-2 text-gray-400 text-xs sm:text-sm">
        <Mail className="w-4 h-4" />
        <a href="mailto:help@KeRaeva.com" className="truncate">
          help@KeRaeva.com
        </a>
      </div>
    </aside>
  );
}
