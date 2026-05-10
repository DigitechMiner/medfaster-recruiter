import type { ReactNode } from "react";
import { AppLayout } from "@/components/global/app-layout";
import { cn } from "@/lib/utils";

interface FormPageLayoutProps {
  children: ReactNode;
  innerClassName?: string;
}

export default function FormPageLayout({
  children,
  innerClassName = "",
}: FormPageLayoutProps) {
  return (
    <AppLayout padding="none">
      <div
        className={cn(
          "flex flex-col gap-4 p-3 sm:p-4 md:p-5 xl:p-6 mx-auto w-full font-sans",
          innerClassName,
        )}
      >
        {children}
      </div>
    </AppLayout>
  );
}
