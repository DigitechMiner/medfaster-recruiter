"use client";

import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

import { CustomButton } from "@/components/custom/custom-button";
import Image from "next/image";
import { landingNavLinks } from "@/utils/constant/landingPage";
import LoginModal from "@/components/global/otpModal";
import { useAuthStore } from "@/stores/authStore";

export function LandingHeader({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("Home");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = usePathname();
  
  // Get auth state from store
  const recruiterProfile = useAuthStore((state) => state.recruiterProfile);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = !!recruiterProfile;

  // Open login modal if user is not authenticated and on /jobs route
  useEffect(() => {
    if (!isAuthenticated && pathname === "/jobs") {
      setIsLoginModalOpen(true);
    }
  }, [isAuthenticated, pathname]);

  const handleLogout = async () => {
    await logout();
    // All state is cleared in authStore, UI will update automatically via Zustand reactivity
  };

  return (
    <div className="w-full bg-white rounded-lg md:rounded-xl lg:rounded-2xl xl:rounded-3xl ">
        <header className="relative w-full flex items-center justify-between p-2 md:p-4 lg:p-6 xl:p-8 px-4 md:px-8 lg:px-16 xl:px-16">
        <div className="flex items-center gap-2">
          <Button
            className="lg:hidden rounded p-2 z-20"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>

          <div className="flex-shrink-0 w-40 md:w-48 lg:w-[200px] flex items-center">
            <Image
              src="/img/brand/new_logo.svg"
              height={50}
              width={200}
              alt="MeDFaster"
              objectFit="contain"
              priority
            />
          </div>
        </div>

        <nav className="hidden lg:flex bg-gray-100 rounded-full p-1 items-center gap-1">
          {landingNavLinks.map((link) => (
            <Button
              key={link.label}
              className={
                active === link.label
                  ? "bg-[#F4781B] text-white rounded-full font-medium px-6 py-2 whitespace-nowrap"
                  : "bg-transparent text-gray-700 rounded-full font-medium px-6 py-2 whitespace-nowrap"
              }
              variant="ghost"
              asChild
              onClick={() => setActive(link.label)}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        {isAuthenticated ? (
          <CustomButton
            className="hidden md:flex my-0"
            style={{
              background: "linear-gradient(225deg, #EB001B 0%, #F79E1B 100%)",
            }}
            onClick={handleLogout}
          >
            Logout
          </CustomButton>
        ) : (
          <CustomButton
            className="hidden md:flex my-0"
            style={{
              background: "linear-gradient(225deg, #EB001B 0%, #F79E1B 100%)",
            }}
            onClick={() => setIsLoginModalOpen(true)} // Open modal instead of redirect
          >
            Login as Recruiter
          </CustomButton>
        )}

        {mobileOpen && (
          <div className="absolute top-[calc(100%+10px)] left-0 w-full max-w-sm min-h-[calc(100vh-100%-30px)] z-50 flex flex-col items-center bg-white border-b rounded-lg shadow-lg lg:hidden justify-between">
            <div className="w-full max-w-sm py-4 px-4">
              {landingNavLinks.map((link) => (
                <Button
                  key={link.label}
                  className={
                    active === link.label
                      ? "bg-[#F4781B] text-white rounded-full font-medium w-full my-1"
                      : "bg-transparent text-gray-700 rounded-full font-medium w-full my-1 hover:bg-[#F4781B]-100"
                  }
                  variant="ghost"
                  asChild
                  onClick={() => {
                    setActive(link.label);
                    setMobileOpen(false);
                  }}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </div>
            <div className="w-full max-w-sm py-4 px-4">
              {isAuthenticated ? (
                <CustomButton
                  className="w-full justify-center my-1 py-2"
                  style={{
                    background: "linear-gradient(225deg, #EB001B 0%, #F79E1B 100%)",
                  }}
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                >
                  Logout
                </CustomButton>
              ) : (
                <CustomButton
                  className="w-full justify-center my-1 py-2"
                  style={{
                    background: "linear-gradient(225deg, #EB001B 0%, #F79E1B 100%)",
                  }}
                  onClick={() => {
                    setMobileOpen(false);
                    setIsLoginModalOpen(true); // Open modal instead of redirect
                  }}
                >
                  Login as Recruiter
                </CustomButton>
              )}
            </div>
          </div>
        )}      
      </header>
      {children}

      {/* Render the login modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

export default LandingHeader;
