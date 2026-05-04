"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  LayoutDashboard, Briefcase, Users, CalendarCheck,
  MessageSquare, Wallet, HelpCircle, Settings,
  Zap, Plus, Bell, User, Building2, LogOut, Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";

const WalletBalance = dynamic(
  () => import("@/components/wallet/wallet-balance").then((m) => m.WalletBalance),
  {
    ssr: false,
    loading: () => <span className="w-16 h-4 bg-gray-100 rounded animate-pulse inline-block" />,
  }
);

export function Navbar() {
  const { isExpanded, setExpanded } = useSidebarStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);
  const [search,      setSearch]      = useState("");

  const pathname        = usePathname();
  const router          = useRouter();
  const logout          = useAuthStore((s) => s.logout);
  const recruiterProfile = useAuthStore((s) => s.recruiterProfile);

  const navLinks = [
    { href: "/",           label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs",       label: "Jobs",       icon: Briefcase       },
    { href: "/candidates", label: "Candidates", icon: Users           },
    { href: "/calendar",   label: "Schedules",  icon: CalendarCheck   },
    { href: "/messages",   label: "Messages",   icon: MessageSquare   },
    { href: "/wallet",     label: "Wallet",     icon: Wallet          },
  ];

  const bottomLinks = [
    { href: "/support",  label: "Support",  icon: HelpCircle },
    { href: "/settings", label: "Settings", icon: Settings   },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.push("/");
  };

  const collapse = () => {
    setExpanded(false);
    setProfileOpen(false);
  };

  // Lock body scroll when notification panel is open
  useEffect(() => {
    document.body.style.overflow = notifOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [notifOpen]);

  return (
    <>
      {/* ── Backdrop — clicking outside sidebar collapses it ─────────────
          Rendered BEHIND the sidebar (z-40), covers the entire screen.
          No event timing issues — it's just a plain onClick div.        */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={collapse}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════════════════
          SIDEBAR  (z-50 — above the backdrop)
      ══════════════════════════════════════════ */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out z-50 flex flex-col min-h-0
          ${isExpanded ? "w-64" : "w-[72px] cursor-pointer"}`}
        onClick={() => { if (!isExpanded) setExpanded(true); }}
      >
        {/* ── Logo ── */}
        <div
          onClick={(e) => {
            if (isExpanded) { e.stopPropagation(); router.push("/"); }
          }}
          className="h-16 flex items-center justify-center px-4 border-b border-gray-100 flex-shrink-0 cursor-pointer select-none"
        >
          {isExpanded ? (
            <Image
              src="/img/brand/new_logo.svg"
              height={36} width={150}
              alt="KeRaeva"
              className="object-contain"
              priority
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center">
              <Image
                src="/img/brand/K-logo.svg"
                height={36} width={36}
                alt="KeRaeva"
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>

        {/* ── Main Nav ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 min-h-0">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              scroll={false}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${
                isActive(href)
                  ? "bg-orange-50 text-[#F4781B]"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                isActive(href) ? "text-[#F4781B]" : "text-gray-400 group-hover:text-gray-600"
              }`} />
              {isExpanded && (
                <span className="text-sm font-medium whitespace-nowrap pointer-events-none">
                  {label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* ── Bottom Section ── */}
        <div className="border-t border-gray-100 flex-shrink-0">
          <nav className="px-3 py-3 space-y-1">
            {bottomLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                scroll={false}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${
                  isActive(href)
                    ? "bg-orange-50 text-[#F4781B]"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
                {isExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap pointer-events-none">
                    {label}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* ── User Profile ── */}
          <div className="px-3 py-3 border-t border-gray-100 relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isExpanded) setExpanded(true);
                else setProfileOpen((o) => !o);
              }}
              className="flex items-center gap-3 w-full rounded-xl hover:bg-gray-50 p-1.5 transition-colors"
            >
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src="/svg/Photo.svg"
                  alt="Profile"
                  fill
                  className="object-cover rounded-full border-2 border-[#F4781B]"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              {isExpanded && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {recruiterProfile?.contact_person_name ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {recruiterProfile?.contact_person_email ?? "—"}
                  </p>
                </div>
              )}
            </button>

            {/* Profile dropdown */}
            {profileOpen && isExpanded && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
              >
                <button
                  onClick={() => { router.push("/profile"); setProfileOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={18} className="text-gray-400 flex-shrink-0" />
                  <span className="font-medium">View profile</span>
                </button>
                <button
                  onClick={() => { router.push("/organization"); setProfileOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50"
                >
                  <Building2 size={18} className="text-gray-400 flex-shrink-0" />
                  <span className="font-medium">Organization Details</span>
                </button>
                <div className="border-t border-gray-100" />
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={18} className="text-gray-400 flex-shrink-0" />
                  <span className="font-medium">
                    {loggingOut ? "Signing out..." : "Sign out"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          TOP HEADER  (z-40 — same level as backdrop, above page content)
      ══════════════════════════════════════════ */}
      <header
        className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200
          flex items-center gap-3 px-6 z-40 transition-all duration-300
          ${isExpanded ? "left-64" : "left-[72px]"}`}
      >
        {/* Search bar */}
        <div className="flex items-center flex-1 max-w-sm">
          <div className="flex items-center w-full gap-2 bg-gray-50 border border-gray-200
            rounded-lg px-3 h-9 focus-within:border-[#F4781B]
            focus-within:ring-1 focus-within:ring-[#F4781B]/20 transition-all">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, candidates..."
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
            />
          </div>
        </div>

        {/* Right-side actions */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => router.push("/jobs/instant-replacement")}
            className="flex items-center gap-1.5 border border-[#F4781B] text-[#F4781B]
              hover:bg-orange-50 rounded-lg px-4 py-1.5 text-sm font-semibold
              transition-colors whitespace-nowrap h-9"
          >
            <Zap size={14} className="fill-[#F4781B]" />
            <em>Urgent Shift</em>
          </button>

          <button
            onClick={() => router.push("/jobs/create")}
            className="flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white
              rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap h-9"
          >
            <Plus size={14} /> Regular Job
          </button>

          {/* Wallet */}
          <button
            onClick={() => router.push('/wallet/topup')}
            className="flex items-center gap-2 rounded-lg h-9 px-2 hover:bg-gray-50 transition-colors"
          >
            <Wallet size={16} className="text-gray-400" />
            <WalletBalance />
            <span className="text-sm text-[#F4781B] bg-orange-100 font-semibold p-1.5 rounded-lg">
              Recharge Wallet
            </span>
          </button>

          {/* Bell */}
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className={`relative p-2 rounded-lg transition-colors border h-9 w-9
              flex items-center justify-center ${
              notifOpen
                ? "bg-orange-50 border-[#F4781B] text-[#F4781B]"
                : "hover:bg-gray-100 border-gray-200 text-gray-500"
            }`}
            aria-label="Notifications"
          >
            <Bell size={16} />
            {!notifOpen && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
            )}
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          NOTIFICATION BACKDROP + PANEL
      ══════════════════════════════════════════ */}
      {notifOpen && (
        <>
          <div
            className="fixed inset-0 z-[59] bg-black/20 backdrop-blur-[1px]"
            onClick={() => setNotifOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-[60]">
            <NotificationPanel onClose={() => setNotifOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}