"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { Heading } from "@/components/custom/heading";
import { Section } from "@/components/custom/section";
import { CustomButton } from "@/components/custom/custom-button";
import { ResponsiveParagraph } from "@/components/custom/paragraph";
import { landingFooterColumns } from "@/constants/landingPage";

export function LandingFooter() {
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
      <div className="w-full">
        <div className="flex flex-col gap-6 border-b pb-8 mb-8 sm:pb-12 sm:mb-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <Heading as="h2" size="md" className="leading-tight">
              Get Career Insights & Top{" "}
              <span className="text-[#F4781B]">Job Alerts</span>
            </Heading>
          </div>

          <div className="flex flex-1 flex-col gap-2 lg:min-w-[420px]">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="rounded-full h-12 lg:w-[420px] px-5 text-sm sm:text-base sm:flex-1"
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

        <div className="space-y-6 sm:space-y-8">
          {/* Two-column layout: Left (logo + contact), Right (links) */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Left: Logo + Contact */}
            <div className="space-y-6 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:gap-12 md:gap-16">
                <div className="space-y-1">
                  <ResponsiveParagraph
                    size="xs"
                    className="text-muted-foreground font-medium"
                  >
                    Email Address
                  </ResponsiveParagraph>
                  <ResponsiveParagraph size="sm" className="whitespace-nowrap">
                    info@medfaster.com
                  </ResponsiveParagraph>
                </div>
                <div className="space-y-1 mt-4 sm:mt-0">
                  <ResponsiveParagraph
                    size="xs"
                    className="text-muted-foreground font-medium"
                  >
                    Phone Number
                  </ResponsiveParagraph>
                  <ResponsiveParagraph size="sm" className="whitespace-nowrap">
                    (416) 555-0123
                  </ResponsiveParagraph>
                </div>
              </div>
            </div>

            {/* Right: Footer Links - Three Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {landingFooterColumns.map((column) => (
                <div key={column.title} className="space-y-4">
                  <ResponsiveParagraph
                    size="sm"
                    className="font-semibold text-[#252B37]"
                  >
                    {column.title}
                  </ResponsiveParagraph>
                  <nav className="flex flex-col gap-3">
                    {column.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="text-sm text-[#717680] hover:text-[#F4781B] transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <ResponsiveParagraph
                size="xs"
                className="text-muted-foreground order-2 sm:order-1"
              >
                Copyright © 2025 MeDFaster, All Rights Reserved.
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

export default LandingFooter;
