"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import { CustomButton } from "@/components/custom/custom-button";
import Image from "next/image";

export default function ComingSoonPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage("✓ Thank you! We'll notify you soon.");
      setEmail("");
    } catch {
      setMessage("✗ Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="h-screen w-screen bg-white flex items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-4 md:space-y-6">
        <div className="relative w-36 md:w-48 lg:w-56 h-10 md:h-12 lg:h-14">
          <Image
            src="/img/brand/new_logo.svg"
            alt="KeRaeva"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80">
          <Image
            src="/img/features/coming-soon.svg"
            alt="Coming Soon"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#252B37]">Stay Tuned</h1>

        <p className="text-sm md:text-base lg:text-lg text-[#717680] max-w-2xl leading-relaxed px-4">
          Get the latest updates on the KeRaeva platform, exclusive invites, and early access for
          healthcare professionals and recruiters in Canada.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl flex flex-col sm:flex-row gap-2 md:gap-3 items-center px-4"
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="h-10 md:h-12 px-4 md:px-5 text-xs sm:text-sm md:text-base flex-1 rounded-full border-gray-300"
            disabled={isSubmitting}
            required
          />
          <CustomButton
            type="submit"
            disabled={isSubmitting}
            rightIcon={ChevronRight}
            size="md"
            className="w-full sm:w-auto my-0 justify-center rounded-full px-6 md:px-8 h-10 md:h-12"
            style={{
              background: "linear-gradient(225deg, #EB001B 0%, #F79E1B 100%)",
            }}
          >
            {isSubmitting ? "Submitting..." : "Notify Me"}
          </CustomButton>
        </form>

        {message && (
          <p
            className={`text-xs md:text-sm ${
              message.includes("✓")
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-xs md:text-sm text-[#717680] px-4">
          Sign up to get early launch notification of our launch date!
        </p>
      </div>
    </div>
  );
}
