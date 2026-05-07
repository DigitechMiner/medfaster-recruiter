import type { ReactNode } from "react";

interface FormPageLayoutProps {
  children: ReactNode;
  innerClassName?: string;
}

export default function FormPageLayout({
  children,
  innerClassName = "",
}: FormPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <div className="p-6 font-sans">
        <div className={`mx-auto ${innerClassName}`}>{children}</div>
      </div>
    </div>
  );
}
