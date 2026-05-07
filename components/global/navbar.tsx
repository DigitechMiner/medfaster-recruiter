"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  LayoutDashboard, Briefcase, Users, CalendarCheck,
  Wallet, HelpCircle, Settings,
  Zap, Plus, Bell, User, Building2, LogOut, Menu, MessageCircleMore,
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

const NO_SIDEBAR_ROUTES = ["/messages"];
const desktopProfileItemClass =
  "flex items-center gap-3 w-full px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors";
type ProfileMenuItem = {
  label: string;
  icon: typeof User;
  onClick: () => void;
  disabled?: boolean;
};

export function Navbar() {
  const { isExpanded, setExpanded } = useSidebarStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);

  const pathname        = usePathname();
  const router          = useRouter();
  const logout          = useAuthStore((s) => s.logout);
  const recruiterProfile = useAuthStore((s) => s.recruiterProfile);
  const showSidebar = !NO_SIDEBAR_ROUTES.some((route) => pathname.startsWith(route));

  const navLinks = [
    { href: "/",           label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs",       label: "Jobs",       icon: Briefcase       },
    { href: "/candidates", label: "Candidates", icon: Users           },
    { href: "/calendar",   label: "Schedules",  icon: CalendarCheck   },
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
  // Clear wallet first so WalletBalance stops fetching before unmount
  const { useWalletStore } = await import('@/stores/walletStore');
  useWalletStore.getState().clearWallet();
  await logout();
  router.push("/auth");
};

  const collapse = () => {
    setExpanded(false);
    setProfileOpen(false);
  };

  const collapseOnMobile = () => {
    if (window.innerWidth < 768) {
      collapse();
    }
  };

  const closeProfileAndNavigate = (href: string) => {
    router.push(href);
    setProfileOpen(false);
  };

  const baseProfileItems = [
    { label: "View profile", icon: User, href: "/profile" },
    { label: "Organization Details", icon: Building2, href: "/organization" },
  ];

  const extraMobileProfileItems = [
    { label: "Support", icon: HelpCircle, href: "/support" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  const desktopProfileItems: ProfileMenuItem[] = [
    ...baseProfileItems.map((item) => ({
      label: item.label,
      icon: item.icon,
      onClick: () => closeProfileAndNavigate(item.href),
    })),
    {
      label: loggingOut ? "Signing out..." : "Sign out",
      icon: LogOut,
      onClick: handleLogout,
      disabled: loggingOut,
    },
  ];

  const mobileProfileItems: ProfileMenuItem[] = [
    ...baseProfileItems,
    ...extraMobileProfileItems,
  ].map((item) => ({
    label: item.label,
    icon: item.icon,
    onClick: () => closeProfileAndNavigate(item.href),
  }));

  mobileProfileItems.push({
    label: loggingOut ? "Signing out..." : "Sign out",
    icon: LogOut,
    onClick: handleLogout,
    disabled: loggingOut,
  });

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
      {showSidebar && isExpanded && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={collapse}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════════════════
          SIDEBAR  (z-50 — above the backdrop)
      ══════════════════════════════════════════ */}
      {showSidebar && (
        <aside
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200
            transition-all duration-300 ease-in-out z-50 flex flex-col min-h-0 overflow-hidden
            md:w-64 ${isExpanded ? "w-64" : "w-0 md:w-64"}`}
        >
        {/* ── Main Nav ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 min-h-0">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              scroll={false}
              onClick={collapseOnMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${
                isActive(href)
                  ? "bg-orange-50 text-[#F4781B]"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                isActive(href) ? "text-[#F4781B]" : "text-gray-400 group-hover:text-gray-600"
              }`} />
              <span className={`${isExpanded ? "block" : "hidden"} md:block text-sm font-medium whitespace-nowrap pointer-events-none`}>
                {label}
              </span>
            </Link>
          ))}
        </nav>

        {/* ── Bottom Section ── */}
        <div className="border-t border-gray-100 flex-shrink-0">
          <nav className="hidden md:block px-3 py-3 space-y-1">
            {bottomLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                scroll={false}
                onClick={collapseOnMobile}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${
                  isActive(href)
                    ? "bg-orange-50 text-[#F4781B]"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
                <span className={`${isExpanded ? "block" : "hidden"} md:block text-sm font-medium whitespace-nowrap pointer-events-none`}>
                  {label}
                </span>
              </Link>
            ))}
          </nav>

          {/* ── User Profile (Desktop) ── */}
          <div className="hidden md:block px-3 py-3 border-t border-gray-100 relative">
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
                  src={recruiterProfile?.organization_photo_url || "/svg/Photo.svg"}
                  alt="Profile"
                  fill
                  className="object-cover rounded-full border-2 border-[#F4781B]"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className={`${isExpanded ? "block" : "hidden"} md:block flex-1 min-w-0 text-left`}>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {recruiterProfile?.contact_person_name ?? "—"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {recruiterProfile?.contact_person_email ?? "—"}
                </p>
              </div>
            </button>

            {/* Profile dropdown */}
            {profileOpen && isExpanded && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
              >
                {desktopProfileItems.map(({ label, icon: Icon, onClick, disabled }, index) => (
                  <button
                    key={label}
                    onClick={onClick}
                    disabled={disabled}
                    className={`${desktopProfileItemClass} ${index > 0 ? "border-t border-gray-50" : ""}`}
                  >
                    <Icon size={15} className="text-gray-400 flex-shrink-0" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        </aside>
      )}

      {/* ══════════════════════════════════════════
          TOP HEADER  (z-40 — same level as backdrop, above page content)
      ══════════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200
          flex items-center gap-1 px-3 md:px-6 z-[60]"
      >
        {showSidebar && (
          <button
            onClick={() => setExpanded(!isExpanded)}
            className="md:hidden h-9 w-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center"
            aria-label={isExpanded ? "Close menu" : "Open menu"}
          >
            <Menu size={16} />
          </button>
        )}

        <button
          onClick={() => router.push("/")}
          className="flex items-center justify-center cursor-pointer"
          aria-label="Go to dashboard"
        >
          <Image
            src="/img/brand/new_logo.svg"
            height={36} width={120}
            alt="KeRaeva"
            className="hidden md:block h-6 w-auto object-contain"
            priority
          />
          <Image
            src="/img/brand/K-logo.svg"
            height={36} width={36}
            alt="KeRaeva"
            className="md:hidden h-9 w-9 object-contain"
            priority
          />
        </button>

        {/* Right-side actions */}
        <div className="ml-auto flex items-center gap-1 md:gap-3">
          <button
            onClick={() => router.push("/jobs/instant-replacement")}
            className="hidden lg:flex items-center gap-1.5 border border-[#F4781B] text-[#F4781B]
              hover:bg-orange-50 rounded-lg px-4 py-1.5 text-sm font-semibold
              transition-colors whitespace-nowrap h-9"
          >
            <Zap size={14} className="fill-[#F4781B]" />
            <em>Urgent Shift</em>
          </button>

          <button
            onClick={() => router.push("/jobs/create")}
            className="hidden md:flex items-center gap-1.5 bg-[#F4781B] hover:bg-[#e06a10] text-white
              rounded-lg px-3 sm:px-4 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap h-9 shadow-sm"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Regular Job</span>
          </button>

          {/* Wallet */}
          <button
            onClick={() => router.push('/wallet')}
            className="hidden md:flex items-center gap-2 rounded-lg h-9 px-2.5 border border-gray-200
              hover:bg-gray-50 transition-colors"
          >
            <Wallet size={16} className="text-gray-400" />
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                router.push("/wallet/topup");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push("/wallet/topup");
                }
              }}
              className="flex items-center gap-2 rounded-md"
            >
              <WalletBalance />
              <span className="hidden xl:inline text-base leading-none text-[#F4781B] bg-orange-100 font-bold px-2.5 py-1 rounded-md">
                +
              </span>
            </span>
          </button>

          {/* Chat */}
          <button
            onClick={() => router.push("/messages")}
            className="relative p-2 rounded-lg transition-colors h-9 w-9
              flex items-center justify-center text-[#F4781B] hover:bg-orange-50
              md:bg-orange-50 md:border md:border-[#F4781B]/30"
            aria-label="Messages"
          >
            <MessageCircleMore size={20} strokeWidth={2.25} />
          </button>

          {/* Bell */}
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className={`relative p-2 rounded-lg transition-colors h-9 w-9 text-[#F4781B]
              md:bg-orange-50 md:border md:border-[#F4781B]/30
              flex items-center justify-center ${
              notifOpen
                ? "bg-orange-50 shadow-sm"
                : "hover:bg-orange-50"
            }`}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {!notifOpen && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
            )}
          </button>

          {/* Mobile Profile */}
          <div className="relative md:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProfileOpen((o) => !o);
              }}
              className="flex items-center justify-center h-9 w-9 rounded-full transition-colors"
              aria-label="Open profile menu"
            >
              <div className="relative w-7 h-7">
                <Image
                  src={recruiterProfile?.organization_photo_url || "/svg/Photo.svg"}
                  alt="Profile"
                  fill
                  className="object-cover rounded-full border border-[#F4781B]"
                />
              </div>
            </button>

            {profileOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-[calc(100%+8px)] w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[70] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {recruiterProfile?.contact_person_name ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {recruiterProfile?.contact_person_email ?? "—"}
                  </p>
                </div>
                {mobileProfileItems.map(({ label, icon: Icon, onClick, disabled }, index) => (
                  <button
                    key={label}
                    onClick={onClick}
                    disabled={disabled}
                    className={`${desktopProfileItemClass} ${index > 0 ? "border-t border-gray-50" : ""}`}
                  >
                    <Icon size={18} className="text-gray-400 flex-shrink-0" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
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