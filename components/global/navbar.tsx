"use client";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/authStore"; // ← adjust path if needed

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/jobs", label: "Jobs" },
    { href: "/messages", label: "Message" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout(); // hits RECRUITER_LOGOUT + resets Zustand state
    router.push("/"); // redirect to login after logout
  };

  return (
    <nav className="relative bg-white border-b border-gray-200">
      <div className="mx-auto p-2 md:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Left: Hamburger + Logo + Nav Links */}
          <div className="flex items-center gap-2">
            <Button
              className="md:hidden rounded p-2 z-20"
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            <div
              className="flex-shrink-0 w-40 md:w-48 lg:w-[200px] flex items-center cursor-pointer"
              onClick={() => router.push("/")}
            >
              <Image
                src="/img/brand/new_logo.svg"
                height={50}
                width={200}
                alt="MeDFaster"
                objectFit="contain"
                priority
              />
            </div>

            <div className="hidden md:ml-10 md:flex items-center gap-4 lg:gap-6">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  className={`px-6 py-2 rounded-md transition-colors text-sm font-medium ${
                    isActive(link.href)
                      ? "text-white bg-[#F4781B]"
                      : "bg-transparent text-gray-700 hover:bg-gray-50"
                  }`}
                  asChild
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Right: Hospital Badge + Bell + Logout */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Hospital Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-2 lg:px-3 py-2 rounded-lg">
              <div className="relative w-6 h-6 lg:w-8 lg:h-8">
                <Image
                  src="/svg/hospital-icon.svg"
                  alt="Hospital Icon"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-xs lg:text-sm font-medium text-gray-900">
                  Narayana Hospital
                </span>
                <span className="text-xs text-gray-500">Admin</span>
              </div>
            </div>

            {/* Notification Bell */}
            <div className="relative cursor-pointer p-2 border-2 border-gray-200 rounded-lg hover:border-gray-600 transition-colors">
              <Image
                src="/svg/bell-icon.svg"
                alt="Notifications"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>

            {/* ✅ Logout Button */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-2 border-2 border-gray-200 rounded-lg hover:border-red-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              {loggingOut ? (
                <span className="text-xs text-gray-400">...</span>
              ) : (
                <LogOut size={20} />
              )}
            </Button>

          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-[calc(100%+10px)] left-0 w-full max-w-sm min-h-[calc(100vh-100%-30px)] z-50 flex flex-col items-center bg-white border-b rounded-lg shadow-lg md:hidden justify-between">
            <div className="w-full flex flex-col items-center max-w-sm py-4 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md font-medium w-full my-1 px-4 py-2 text-center transition-colors text-sm ${
                    isActive(link.href)
                      ? "text-white bg-[#F4781B]"
                      : "bg-transparent text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile: Hospital Badge + Logout */}
            <div className="w-full max-w-sm py-4 px-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <div className="relative w-8 h-8">
                  <Image
                    src="/svg/hospital-icon.svg"
                    alt="Hospital Icon"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    Narayana Hospital
                  </span>
                  <span className="text-xs text-gray-500">Admin</span>
                </div>
              </div>

              {/* ✅ Mobile Logout */}
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg py-2"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">
                  {loggingOut ? "Logging out..." : "Logout"}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
