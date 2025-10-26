"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { CustomButton } from "@/components/ui/custom-button";
import { ResponsiveParagraph } from "@/components/ui/paragraph";

export function Footer() {
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage(`✓ Successfully subscribed with ${email}!`);
      setEmail("");
    } catch (error) {
      setMessage("✗ Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section className="border-t bg-card">
      <div className="container">
        {/* Newsletter Section */}
        <div className="flex flex-col gap-6 border-b pb-8 mb-8 sm:pb-12 sm:mb-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <Heading as="h2" size="md" className="leading-tight">
              Hiring Insights & Top
              
              <span className="text-[#F4781B]">{" "}Candidate Alerts</span>
            </Heading>
          </div>

          <div className="flex flex-col gap-2 w-full lg:w-auto lg:min-w-[420px]">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col w-full gap-3 sm:flex-row"
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-full h-12 lg:w-[420px] px-5 text-sm sm:text-base sm:flex-1"
                disabled={isSubmitting}
                required
              />
              <CustomButton
                type="submit"
                disabled={isSubmitting}
                rightIcon={ChevronRight}
                size="md"
                className="w-full sm:w-auto my-0 justify-center"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </CustomButton>
            </form>
            {message && (
              <ResponsiveParagraph
                size="xs"
                className={`px-2 ${
                  message.includes("✓")
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {message}
              </ResponsiveParagraph>
            )}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="space-y-6 sm:space-y-8">
          {/* Row 1: Logo Image and Navigation */}
          <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-40 md:w-48 lg:w-[200px] h-8 sm:w-40 sm:h-10">
              <Image
                src="/img/logo.png"
                alt="MeDFasterrrrr Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>

            <nav className="flex flex-wrap gap-4 sm:gap-6 lg:gap-8">
              <a
                href="#about"
                className="text-sm sm:text-base hover:text-primary transition-colors"
              >
                Post a job
              </a>
              <a
                href="#jobs"
                className="text-sm sm:text-base hover:text-primary transition-colors"
              >
                Pricing
              </a>
              <a
                href="#blog"
                className="text-sm sm:text-base hover:text-primary transition-colors"
              >
                Hiring Blog
              </a>
              <a
                href="#contact"
                className="text-sm sm:text-base hover:text-primary transition-colors"
              >
                About Us
              </a>
            </nav>
          </div>

          {/* Row 2: Email and Phone in Same Row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-8 md:gap-12">
            <div className="space-y-1">
              <ResponsiveParagraph size="xs" className="text-muted-foreground font-medium">
                Email Address
              </ResponsiveParagraph>
              <ResponsiveParagraph size="sm" className="break-all">
                info@medfasterrrrr.com
              </ResponsiveParagraph>
            </div>
            <div className="space-y-1">
              <ResponsiveParagraph size="xs" className="text-muted-foreground font-medium">
                Phone Number
              </ResponsiveParagraph>
              <ResponsiveParagraph size="sm">(416) 555-0123</ResponsiveParagraph>
            </div>
          </div>

          {/* Divider Line */}
          <div className="border-t" />

          {/* Row 3: Copyright and Social Icons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <ResponsiveParagraph size="xs" className="text-muted-foreground order-2 sm:order-1">
              Copyright © 2025 MeDFasterrrrr, All Rights Reserved.
            </ResponsiveParagraph>

            <div className="flex gap-3 sm:gap-4 order-1 sm:order-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:-translate-y-1 transition-transform"
                aria-label="Facebook"
              >
                <FaFacebook className="h-5 w-5 sm:h-6 sm:w-6 text-[#1877F2]" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:-translate-y-1 transition-transform"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="h-5 w-5 sm:h-6 sm:w-6 text-[#0A66C2]" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:-translate-y-1 transition-transform"
                aria-label="Instagram"
              >
                <FaInstagram className="h-5 w-5 sm:h-6 sm:w-6 text-[#E4405F]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
