"use client";

{/*"use client";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/jobs", label: "Jobs" },
    { href: "/message", label: "Message" },
    { href: "/closed-job", label: "Closed Job" },
  ];

  return (
    <nav className="relative bg-white border-b border-gray-200">
      <div className="mx-auto p-2 md:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left Section: Hamburger (mobile) + Logo (desktop) */}
          {/*
          <div className="flex items-center gap-2">
            <Button
              className="md:hidden rounded p-2 z-20"
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            <div className="flex-shrink-0 w-40 md:w-48 lg:w-[200px] flex items-center cursor-pointer" onClick={() => router.push("/")}>
              <Image
                src="/img/brand/new_logo.svg"
                height={50}
                width={200}
                alt="MeDFaster"
                objectFit="contain"
                priority
              />
            </div>

            {/* Navigation Links - Desktop Only */}
            {/*
            <div className="hidden md:ml-10 md:flex items-center gap-4 lg:gap-6">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                className={`px-6 py-2 rounded-md transition-colors text-sm font-medium ${
                  pathname.startsWith(link.href)
                    ? "text-white bg-[#F4781B] "
                    : "bg-transparent text-gray-700 hover:bg-gray-50"
                }`}
                asChild
             >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
            </div>
          </div>

          {/* Right Section */}
          {/*
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Hospital Badge - Hidden on Mobile */}
            {/*
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
            {/*
            <div className="relative cursor-pointer p-2 border-2 border-gray-200 rounded-lg hover:border-gray-600 transition-colors">
              <Image
                src="/svg/bell-icon.svg"
                alt="Notifications"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {/*
        {mobileMenuOpen && (
          <div className="absolute top-[calc(100%+10px)] left-0 w-full max-w-sm min-h-[calc(100vh-100%-30px)] z-50 flex flex-col items-center bg-white border-b rounded-lg shadow-lg md:hidden justify-between">
            <div className="w-full flex flex-col items-center max-w-sm py-4 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                className={`rounded-md font-medium w-full my-1 px-4 py-2 text-center transition-colors text-sm ${
                  pathname.startsWith(link.href)
                    ? "text-white bg-[#F4781B]"
                    : "bg-transparent text-gray-700 hover:bg-gray-50"
                }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="w-full max-w-sm py-4 px-4">
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
            </div>
          </div>
        )}
      </div>
    </nav> /*}
  );
}
*/}
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Home,
  Users,
  Building2,
  FlaskConical,
  UserCog,
  HelpCircle,
  Settings,
  Menu,
  X,
} from "lucide-react";

interface NavbarProps {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

export function Navbar({ isExpanded, setIsExpanded }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patient-management", label: "Patient Management", icon: Users },
    { href: "/clinic-management", label: "Clinic Management", icon: Building2, badge: 8 },
    { href: "/lab-management", label: "Lab Management", icon: FlaskConical },
    { href: "/staff-management", label: "Staff Management", icon: UserCog },
  ];

  const recruitmentSubLinks = [
    { href: "/dashboard", label: "Dashboard", badge: 18 },
    { href: "/jobs", label: "Jobs" },
    { href: "/message", label: "Message" },
    { href: "/closed-job", label: "Closed Job" },
  ];

  const bottomLinks = [
    { href: "/support", label: "Support", icon: HelpCircle },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const isRecruitmentActive = recruitmentSubLinks.some((link) =>
    pathname.startsWith(link.href)
  );

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 flex flex-col overflow-hidden ${
          isExpanded ? "w-64" : "w-20"
        }`}
      >
        {/* Logo Section with Toggle Button */}
        <div className="h-16 flex items-center gap-2 px-3 flex-shrink-0">
          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            {isExpanded ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Logo - Only show when expanded */}
          {isExpanded && (
            <div
              className="flex-shrink-0 flex items-center cursor-pointer overflow-hidden"
              onClick={() => router.push("/")}
            >
              <Image
                src="/img/brand/new_logo.svg"
                height={32}
                width={120}
                alt="KeRaeva"
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors relative group ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && (
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {link.label}
                    </span>
                  )}
                  {link.badge && isExpanded && (
                    <span className="ml-auto bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded flex-shrink-0">
                      {link.badge}
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap pointer-events-none z-50">
                      {link.label}
                    </div>
                  )}
                </Link>
              );
            })}

            {/* Recruitment Section */}
            <div className="pt-2">
              <div
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors relative group ${
                  isRecruitmentActive
                    ? "bg-orange-50 text-[#F4781B]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Briefcase className="w-5 h-5 flex-shrink-0" />
                {isExpanded && (
                  <span className="text-sm font-medium overflow-hidden text-ellipsis">Recruitment</span>
                )}
                
                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap pointer-events-none z-50">
                    Recruitment
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {recruitmentSubLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? "text-[#F4781B] font-medium"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <span className="overflow-hidden text-ellipsis">{link.label}</span>
                        {link.badge && (
                          <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded flex-shrink-0">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 flex-shrink-0">
          {/* Bottom Navigation */}
          <nav className="px-3 py-3 space-y-1">
            {bottomLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors relative group ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && (
                    <span className="text-sm font-medium overflow-hidden text-ellipsis">{link.label}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap pointer-events-none z-50">
                      {link.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="px-3 py-3 border-t border-gray-200">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src="/svg/hospital-icon.svg"
                  alt="User"
                  fill
                  className="object-contain rounded-full"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              {isExpanded && (
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Nidhi Gohil
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    nidhi@KeRaeva.com
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Top Header - Fixed positioning with proper z-index */}
      <header 
        className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40 transition-all duration-300 overflow-hidden ${
          isExpanded ? "left-64" : "left-20"
        }`}
      >
        {/* Welcome Text - Left Side */}
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome, <span className="text-gray-700">Jay</span>
          </h2>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 w-64"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
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
        </div>
      </header>
    </>
  );
}
