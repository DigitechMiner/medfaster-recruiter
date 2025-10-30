import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

type AppLayoutProps = {
  children: ReactNode;
  padding?: "none" | "all" | "x" | "y";
};

export function AppLayout({ children, padding = "x" }: AppLayoutProps) {
  const paddingClasses =
    padding === "none"
      ? "p-0"
      : padding === "x"
        ? "px-4 md:px-8 lg:px-16 py-2 md:py-4 lg:py-6"
        : padding === "y"
          ? "py-4 md:py-8 lg:py-16 px-2 md:px-4 lg:px-6"
          : "p-4 md:p-8 lg:p-16";
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F1]">
      <Navbar />
      <main className={` mx-auto flex-1 w-full ${paddingClasses}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}


