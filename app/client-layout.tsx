// client-layout.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import GoogleOAuthProviderWrapper from "@/provider/GoogleOAuthProvider";
import { ToastContainer } from "react-toastify";
import { useAuthStore } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { Navbar } from "@/components/global/navbar";
import { Footer } from "@/components/global/footer";

const NO_NAVBAR_ROUTES = ["/registration", "/login", "/coming-soon"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const loadRecruiterProfile = useAuthStore((state) => state.loadRecruiterProfile);
  const isExpanded = useSidebarStore((s) => s.isExpanded);
  const pathname = usePathname();
  const showChrome = !NO_NAVBAR_ROUTES.includes(pathname);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await loadRecruiterProfile();
      } catch (error) {
        useAuthStore.setState({
          recruiterProfile: null,
          recruiterDocuments: null,
        });
        console.log("User not authenticated:", error);
      }
    };
    loadProfile();
  }, [loadRecruiterProfile]);

  return (
    <>
      <GoogleOAuthProviderWrapper>
        {showChrome && <Navbar />}

        <div
          className={`transition-all duration-300 ease-in-out flex flex-col min-h-screen ${
            showChrome
              ? `pt-16 ${isExpanded ? "ml-64" : "ml-[72px]"}`
              : ""
          }`}
        >
          <main className="flex-1">
            {children}
          </main>

          {showChrome && <Footer />}
        </div>

      </GoogleOAuthProviderWrapper>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}