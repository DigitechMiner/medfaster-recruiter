"use client";

import { useEffect } from "react";
import GoogleOAuthProviderWrapper from "@/provider/GoogleOAuthProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "@/stores/authStore";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const loadRecruiterProfile = useAuthStore((state) => state.loadRecruiterProfile);

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
        {children}
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
