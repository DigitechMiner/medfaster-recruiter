"use client";

import { useState, useEffect } from "react";
import { ComingSoon } from "@/components/global/comming-soon";
import Image from "next/image";

export default function ComingSoonPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 second preloader

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-48 h-16 animate-pulse">
            <Image
              src="/img/brand/new_logo.svg"
              alt="KeRaeva"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-[#F4781B] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-[#EB001B] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-[#F4781B] rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return <ComingSoon />;
}
