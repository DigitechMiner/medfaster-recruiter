"use client";

import { useEffect } from "react";
import GoogleOAuthProviderWrapper from "@/provider/GoogleOAuthProvider";
import { ToastContainer } from "react-toastify";
import { useAuthStore } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { Navbar } from "@/components/global/navbar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const loadRecruiterProfile = useAuthStore((state) => state.loadRecruiterProfile);
  const isExpanded = useSidebarStore((s) => s.isExpanded);

  useEffect(() => {
    // Call getProfile API on mount to check authentication status
    // Cookies will be automatically sent via credentials: 'include' in apiRequest
    const loadProfile = async () => {
      try {
        await loadRecruiterProfile();
      } catch (error) {
        // Set user to null on error
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
        <Navbar />
        <div
  className={`transition-all duration-300 ease-in-out pt-16 ${
    isExpanded ? "ml-64" : "ml-[72px]"
  }`}
>
          {children}
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
