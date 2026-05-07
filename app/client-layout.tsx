"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react"; // ← add
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // ← add
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // ← add
import GoogleOAuthProviderWrapper from "@/provider/GoogleOAuthProvider";
import { ToastContainer } from "react-toastify";
import { useAuthStore } from "@/stores/authStore";
import { useMetadataStore } from "@/stores/metadataStore";
import { Navbar } from "@/components/global/navbar";
import { Footer } from "@/components/global/footer";

const NO_NAVBAR_ROUTES = ["/registration", "/login", "/coming-soon", "/auth"];
const NO_SIDEBAR_ROUTES = ["/messages"];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    // ← add
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const [isProfileResolving, setIsProfileResolving] = useState(true);

  const loadRecruiterProfile = useAuthStore(
    (state) => state.loadRecruiterProfile,
  );
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const loadAll = useMetadataStore((s) => s.loadAll);
  const pathname = usePathname();
  const router = useRouter();
  const showChrome = !NO_NAVBAR_ROUTES.includes(pathname);
  const showSidebar = !NO_SIDEBAR_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      await loadRecruiterProfile().catch((error) => {
        useAuthStore.setState({
          recruiterProfile: null,
          recruiterDocuments: null,
        });
        console.log("User not authenticated:", error);
      });

      if (isMounted) {
        setIsProfileResolving(false);
      }

      // Metadata can keep loading in parallel after profile has resolved.
      void loadAll();
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [loadRecruiterProfile, loadAll]);

  useEffect(() => {
    if (isProfileResolving) return;

    if (!recruiterProfile && pathname !== "/auth") {
      router.replace("/auth");
      return;
    }

    if (recruiterProfile && pathname === "/auth") {
      router.replace("/");
    }
  }, [isProfileResolving, recruiterProfile, pathname, router]);

  if (isProfileResolving) {
    return (
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProviderWrapper>
          <div className="min-h-screen w-full flex items-center justify-center bg-[#F7F5F1]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-[#F4781B] border-t-transparent animate-spin" />
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          </div>
        </GoogleOAuthProviderWrapper>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {" "}
      {/* ← wrap */}
      <GoogleOAuthProviderWrapper>
        {showChrome && <Navbar />}
        <div
          className={`transition-all duration-300 ease-in-out flex flex-col min-h-screen ${
            showChrome ? `pt-16 ${showSidebar ? "md:ml-64" : ""}` : ""
          }`}
        >
          <main className="flex-1">{children}</main>
          {showChrome && showSidebar && <Footer />}
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
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
