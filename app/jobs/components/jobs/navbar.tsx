'use client'
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left Section: Hamburger (mobile) + Logo (desktop) */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button - Orange, Left Side */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Logo - Hidden on mobile, visible on desktop */}
            <Link href="/" className="hidden md:flex items-center shrink-0">
              <Image
                src="/img/brand/medfaster-logo.png"
                alt="MedFaster Logo"
                width={150}
                height={40}
                priority
                className="w-32 md:w-36 h-auto"
              />
            </Link>
          </div>

          {/* Center: Logo on mobile only */}
          <Link href="/" className="md:hidden flex items-center shrink-0">
            <Image
              src="/img/brand/medfaster-logo.png"
              alt="MedFaster Logo"
              width={120}
              height={32}
              priority
              className="w-24 h-auto"
            />
          </Link>

          {/* Navigation Links - Desktop Only */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/jobs"
              className="text-white bg-orange-500 px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              Jobs
            </Link>
            <Link
              href="/message"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Message
            </Link>
            <Link
              href="/closed-job"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Closed Job
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Hospital Badge - Hidden on Mobile */}
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
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top">
            <div className="flex flex-col space-y-3">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium py-2 px-2 rounded-md hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/jobs"
                className="text-white bg-orange-500 px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm font-medium text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Jobs
              </Link>
              <Link
                href="/message"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium py-2 px-2 rounded-md hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Message
              </Link>
              <Link
                href="/closed-job"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium py-2 px-2 rounded-md hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Closed Job
              </Link>
              
              {/* Hospital Info on Mobile */}
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg mt-2">
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
    </nav>
  );
}
