'use client';

import { ArrowDownToLine, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CustomButton } from '@/components/ui/custom-button';
import Image from 'next/image';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/' },
  { label: 'Post Job', href: '/' },
  { label: 'Hiring Blog', href: '/' },
  { label: 'Contact Us', href: '/' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState('Home');

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
      <nav className="hidden lg:flex bg-gray-100 rounded-full p-2 items-center gap-1">
        {navLinks.map((link) => (
          <Button
            key={link.label}
            className={
              active === link.label
                ? 'bg-[#F4781B] text-white rounded-full font-medium px-6 py-2 whitespace-nowrap'
                : 'bg-transparent text-gray-700 rounded-full font-medium px-6 py-2 whitespace-nowrap'
            }
            variant="ghost"
            asChild
            onClick={() => setActive(link.label)}
          >
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </nav>

      {/* Download Button - Desktop Only */}
      <CustomButton className="hidden md:flex my-0" rightIcon={ArrowDownToLine}>Download App</CustomButton>


      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="absolute top-[calc(100%+10px)] left-0 w-full max-w-sm min-h-[calc(100vh-100%-30px)] z-50 flex flex-col items-center bg-white border-b rounded-lg shadow-lg lg:hidden justify-between">
          <div className="w-full max-w-sm py-4 px-4">
            {navLinks.map((link) => (
              <Button
                key={link.label}
                className={
                  active === link.label
                    ? 'bg-[#F4781B] text-white rounded-full font-medium w-full my-1'
                    : 'bg-transparent text-gray-700 rounded-full font-medium w-full my-1 hover:bg-[#F4781B]-100'
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
          <div className='w-full max-w-sm py-4 px-4'>
          <CustomButton className='w-full justify-center my-1' rightIcon={ArrowDownToLine}>Download App</CustomButton>
          </div>
        </div>
      )}
    </header>
  );
}
