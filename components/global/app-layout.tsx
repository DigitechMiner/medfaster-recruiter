"use client";
import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

type AppLayoutProps = {
  children: ReactNode;
  padding?: "none" | "all" | "x" | "y" | "sm";
};

export function AppLayout({ children, padding = "sm" }: AppLayoutProps) {
  const paddingClassesMap = {
    none: "p-0",
    x: "px-4 md:px-8 lg:px-16 py-2 md:py-4 lg:py-6",
    y: "py-4 md:py-8 lg:py-16 px-2 md:px-4 lg:px-6",
    sm: "p-2 md:p-4 lg:p-8",
    all: "p-4 md:p-8 lg:p-16",
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-[#F7F5F1]">
      <Navbar />
      <main className={`flex-1 w-full flex flex-col bg-[#F7F5F1] ${paddingClassesMap[padding]}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}