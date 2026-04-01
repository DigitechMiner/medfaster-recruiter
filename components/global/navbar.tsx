"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Menu, X, Sparkles, Plus,
  LogOut, User, Settings, Building2, Users, HelpCircle
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const profileRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/jobs", label: "Jobs" },
    { href: "/candidates", label: "Candidates" },
    { href: "/calendar", label: "Schedules" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.push("/");
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    // ✅ Fix 1: added w-full to prevent 2/3 width issue below 1024px
    <header className="w-full">
    <nav className="sticky top-0 z-30 w-full bg-white border-b border-gray-200">
      <div className="w-full bg-white">
      <div className="w-full px-4 xl:max-w-[1240px] xl:mx-auto xl:px-8 2xl:max-w-[1350px] 2xl:mx-auto 3xl:mx-0 3xl:px-84 min-w-0">
        <div className="flex items-center justify-between h-14 sm:h-16 w-full">

          {/* ── LEFT ── */}
          <div className="hidden xl:flex items-center xl:gap-8 2xl:gap-8 3xl:gap-7">
            <div className="flex-shrink-0 cursor-pointer xl:mr-1 2xl:mr-2 3xl:mr-4" onClick={() => router.push("/")}>
              <Image src="/img/brand/new_logo.svg" height={36} width={150} alt="KeRaeva" style={{ objectFit: "contain" }} priority />
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`xl:px-3 2xl:px-5 3xl:px-7 xl:py-2 2xl:py-2.5 text-sm font-medium transition-colors whitespace-nowrap rounded-lg ${
                  isActive(link.href) ? "bg-[#F4781B] text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <button
              onClick={() => router.push("/jobs/instant-replacement")}
              className="xl:ml-1 2xl:ml-2 3xl:ml-3 flex items-center gap-1.5 border border-[#F4781B] text-[#F4781B] hover:bg-orange-50 rounded-lg xl:px-3 2xl:px-4 3xl:px-5 py-1.5 text-sm font-medium h-9 transition-colors whitespace-nowrap"
            >
              <Sparkles size={14} /> Instant Replace
            </button>

            <button
              onClick={() => router.push("/jobs/create")}
              className="xl:ml-1 2xl:ml-1 3xl:ml-2 flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white rounded-lg xl:px-4 2xl:px-5 3xl:px-6 py-1.5 text-sm font-medium h-9 transition-colors whitespace-nowrap"
            >
              <Plus size={14} /> Post a Job
            </button>
          </div>

          {/* ── Mobile: Hamburger + Logo ── */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push("/")}>
              <Image src="/img/brand/new_logo.svg" height={36} width={130} alt="KeRaeva" style={{ objectFit: "contain" }} priority />
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="flex gap-1 xl:gap-4 2xl:gap-4 3xl:gap-4 items-center flex-shrink-0">

            {/* ✅ Fix 2: removed hidden xl:flex — now always visible */}
            <button
              className="flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => router.push("/messages")}
              title="Messages"
            >
              <Image src="/icon/icon-chat.svg" width={22} height={22} alt="Messages" />
            </button>

            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Notifications"
            >
              <Image src="/icon/icon-bell.svg" width={22} height={22} alt="Notifications" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-1 ring-white" />
            </button>

            {/* ✅ Fix 2: removed hidden xl:flex — now always visible */}
            <button
              className="flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Billing"
              onClick={() => router.push("/wallet")}
            >
              <Image src="/icon/icon-dollar.svg" width={22} height={22} alt="Billing" />
            </button>

            {/* ── Profile Avatar + Dropdown ── */}
            <div className="relative" ref={profileRef}>
              <button
                className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-[#F4781B] hover:opacity-90 transition-opacity"
                onClick={() => setProfileOpen((o) => !o)}
                title="Profile"
              >
                <Image src="/svg/Photo.svg" alt="Profile" width={32} height={32} className="object-cover w-full h-full" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#F4781B]">
                        <Image src="/svg/Photo.svg" alt="Profile" width={40} height={40} className="object-cover w-full h-full" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-gray-900 truncate">Narayana Hospital</span>
                      <span className="text-xs text-gray-500 truncate">admin@narayana.com</span>
                    </div>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { router.push("/profile"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User size={16} className="text-gray-400 flex-shrink-0" /> View profile
                    </button>
                    <button onClick={() => { router.push("/settings"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings size={16} className="text-gray-400 flex-shrink-0" /> Settings
                    </button>
                    <button onClick={() => { router.push("/organization"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Building2 size={16} className="text-gray-400 flex-shrink-0" /> Organization
                    </button>
                    <button onClick={() => { router.push("/team"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Users size={16} className="text-gray-400 flex-shrink-0" /> Team
                    </button>
                  </div>
                  <div className="border-t border-gray-100" />
                  <div className="py-1">
                    <button onClick={() => { router.push("/support"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <HelpCircle size={16} className="text-gray-400 flex-shrink-0" /> Support
                    </button>
                  </div>
                  <div className="border-t border-gray-100" />
                  <div className="py-1">
                    <button onClick={handleLogout} disabled={loggingOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <LogOut size={16} className="text-gray-400 flex-shrink-0" />
                      {loggingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile Dropdown ── */}
        {mobileMenuOpen && (
          <div className="absolute top-[calc(100%+1px)] left-0 w-full z-50 bg-white border-b shadow-lg xl:hidden">
            <div className="flex flex-col px-4 pt-3 pb-2 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg w-full px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive(link.href) ? "bg-[#F4781B] text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-100 mx-4" />

            <div className="flex flex-col gap-2 px-4 py-3">
              <button
                className="flex items-center justify-center gap-2 border border-[#F4781B] text-[#F4781B] hover:bg-orange-50 rounded-lg w-full py-2.5 text-sm font-medium"
                onClick={() => { router.push("/instant-replace"); setMobileMenuOpen(false); }}
              >
                <Sparkles size={14} /> Instant Replace
              </button>
              <button
                className="flex items-center justify-center gap-2 bg-[#F4781B] hover:bg-[#e06a10] text-white rounded-lg w-full py-2.5 text-sm font-medium"
                onClick={() => { router.push("/jobs/post"); setMobileMenuOpen(false); }}
              >
                <Plus size={14} /> Post a Job
              </button>
            </div>

            {/* ✅ Fix 2: removed duplicate chat/wallet icon block — now in top bar */}

            <div className="border-t border-gray-100 mx-4" />

            <div className="flex flex-col py-1">
              <button onClick={() => { router.push("/profile"); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                <User size={16} className="text-gray-400" /> View profile
              </button>
              <button onClick={() => { router.push("/settings"); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                <Settings size={16} className="text-gray-400" /> Settings
              </button>
              <button onClick={() => { router.push("/organization"); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                <Building2 size={16} className="text-gray-400" /> Organization
              </button>
              <button onClick={() => { router.push("/team"); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                <Users size={16} className="text-gray-400" /> Team
              </button>
              <button onClick={() => { router.push("/support"); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                <HelpCircle size={16} className="text-gray-400" /> Support
              </button>
            </div>

            <div className="border-t border-gray-100 mx-4" />

            <div className="px-4 py-3">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg py-2.5 text-sm font-medium"
              >
                <LogOut size={16} />
                {loggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
          
        )}
        </div>
      </div>
    </nav>
    </header>
  );
}