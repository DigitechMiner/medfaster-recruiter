'use client';

import { ArrowDownToLine, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CustomButton } from '@/components/ui/custom-button';
import Image from 'next/image';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Medical Organizations', href: '/login' },
  { label: 'Medical Professionals', href: '/login' },
  { label: 'Patients', href: '/login' },
  {
    label: 'AI Features', href: '/login', submenu: [
      { label: 'Feature 1', href: '/ai/feature1' },
      { label: 'Feature 2', href: '/ai/feature2' },
    ]
  },
  {
    label: 'Company', href: '/login', submenu: [
      { label: 'About Us', href: '/company/about' },
      { label: 'Careers', href: '/company/careers' },
    ]
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState('Home');
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu((prev) => (prev === label ? null : label));
  };

  return (
    <header className="relative w-full bg-white flex items-center justify-between rounded-lg md:rounded-xl lg:rounded-2xl xl:rounded-3xl p-2 md:px-4 lg:px-6 xl:px-8">
      {/* Left Side - Mobile Menu + Logo */}
      <div className="flex items-center gap-2">
        {/* Mobile Menu Button */}
        <Button
          className="lg:hidden rounded p-2 z-20"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>

        {/* Logo */}
        <div className="flex-shrink-0 w-40 md:w-48 lg:w-[200px] flex items-center">
          <Image
            src="/img/logo.png"
            height={50}
            width={200}
            alt="MeDFaster"
            objectFit="contain"
            priority
          />
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-gray-100 rounded-full p-2 items-center gap-1 relative">
        {navLinks.map((link) => {
          const hasSubmenu = link.submenu && link.submenu.length > 0;
          const isSubmenuOpen = openSubmenu === link.label;
          return (
            <div key={link.label} className="relative">
              <Button
                className={
                  active === link.label
                    ? 'bg-[#F4781B] text-white rounded-full font-medium px-6 py-2 whitespace-nowrap inline-flex items-center gap-1'
                    : 'bg-transparent text-gray-700 rounded-full font-medium px-6 py-2 whitespace-nowrap inline-flex items-center gap-1'
                }
                variant="ghost"
                asChild
                onClick={() => {
                  if (hasSubmenu) {
                    toggleSubmenu(link.label);
                  } else {
                    setActive(link.label);
                    setOpenSubmenu(null);
                  }
                }}
              >
                <div className="inline-flex items-center gap-1">
                  <Link href={link.href}>{link.label}</Link>
                  {hasSubmenu && (
                    <ArrowDownToLine
                      className={`${isSubmenuOpen ? 'rotate-180' : ''} transition-transform`}
                      size={16}
                    />
                  )}
                </div>
              </Button>

              {/* Submenu */}
              {hasSubmenu && isSubmenuOpen && (
                <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg py-2 min-w-[150px] z-50 flex flex-col">
                  {link.submenu!.map((subLink) => (
                    <Link
                      key={subLink.label}
                      href={subLink.href}
                      onClick={() => {
                        setActive(subLink.label);
                        setOpenSubmenu(null);
                      }}
                      className="px-4 py-2 hover:bg-[#F4781B] hover:text-white rounded-md whitespace-nowrap"
                    >
                      {subLink.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Download Button - Desktop Only */}
      <CustomButton className="hidden md:flex my-0" rightIcon={ArrowDownToLine}>
        Download App
      </CustomButton>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="absolute top-[calc(100%+10px)] left-0 w-full max-w-sm min-h-[calc(100vh-100%-30px)] z-50 flex flex-col items-center bg-white border-b rounded-lg shadow-lg lg:hidden justify-between">
          <div className="w-full max-w-sm py-4 px-4">
            {navLinks.map((link) => {
              const hasSubmenu = link.submenu && link.submenu.length > 0;
              const isSubmenuOpen = openSubmenu === link.label;
              return (
                <div key={link.label} className="mb-2">
                  <Button
                    className={
                      active === link.label
                        ? 'bg-[#F4781B] text-white rounded-full font-medium w-full my-1'
                        : 'bg-transparent text-gray-700 rounded-full font-medium w-full my-1 hover:bg-[#F4781B]-100'
                    }
                    variant="ghost"
                    asChild
                    onClick={() => {
                      if (hasSubmenu) {
                        toggleSubmenu(link.label);
                      } else {
                        setActive(link.label);
                        setMobileOpen(false);
                        setOpenSubmenu(null);
                      }
                    }}
                  >
                    <span>
                      <Link href={link.href}>{link.label}</Link>
                    </span>
                  </Button>

                  {/* Mobile submenu */}
                  {hasSubmenu && isSubmenuOpen && (
                    <div className="flex flex-col ml-4 mt-1">
                      {link.submenu!.map((subLink) => (
                        <Button
                          key={subLink.label}
                          className={
                            active === subLink.label
                              ? 'bg-[#F4781B] text-white rounded-full font-medium w-full my-1'
                              : 'bg-transparent text-gray-700 rounded-full font-medium w-full my-1 hover:bg-[#F4781B]-100'
                          }
                          variant="ghost"
                          asChild
                          onClick={() => {
                            setActive(subLink.label);
                            setMobileOpen(false);
                            setOpenSubmenu(null);
                          }}
                        >
                          <Link href={subLink.href}>{subLink.label}</Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="w-full max-w-sm py-4 px-4">
            <CustomButton className="w-full justify-center my-1" rightIcon={ArrowDownToLine}>
              Download App
            </CustomButton>
          </div>
        </div>
      )}
    </header>
  );
}
