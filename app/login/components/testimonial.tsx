"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Paragraph, ResponsiveParagraph } from "@/components/ui/paragraph";
import { FaStar } from "react-icons/fa";

export default function TestimonialsSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      quote:
        "The promise of 100% verified healthcare staff is real. We've had zero compliance issues since switching over, which gives our entire team peace of mind. Totally worth it.",
      name: "Maria R.",
      role: "Compliance Officer",
      avatar: "/img/testimonials/michael.png",
      rating: 3,
    },
    {
      quote:
        "MedFaster cut our hiring time from 6 weeks to just 10 days. The AI matching is incredibly accurate and saves us countless hours of screening.",
      name: "Dr. James Chen",
      role: "Chief Medical Officer",
      avatar: "/img/testimonials/sarah.png",
      rating: 5,
    },
    {
      quote:
        "Finally, a platform that understands healthcare recruitment. The credential verification alone is worth the investment.",
      name: "Sarah Mitchell",
      role: "HR Director",
      avatar: "/img/testimonials/sarah.png",
      rating: 4,
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const currentTestimonial = testimonials[currentSlide];

  return (
    <Section>
      {/* Header */}
      <div className="mb-8 md:mb-12 lg:mb-16">
        <Heading className="text-[#252B37] mb-4">
          Why Leading Hospitals Trust{" "}
          <span className="text-[#F4781B] font-semibold">MedFaster</span>
        </Heading>
        <Paragraph className="text-[#717680] max-w-3xl">
          Real results from healthcare partners who have transformed their
          hiring process. See how we help them save time, ensure compliance, and
          hire top-tier talent.
        </Paragraph>
      </div>

      {/* Testimonial Card */}
      <div className="relative p-4 md:p-8 lg:p-16 ">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Left Side - Quote Icon */}
          <div className="flex-shrink-0 w-9 h-9 md:w-12 md:h-12 lg:w-16 lg:h-16">
            <img
              src='/icon/quote.svg'
              alt="Quote"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Right Side - Stars, Description, Author */}
          <div className="flex-1">
            {/* Star Rating */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`w-5 h-5 ${
                    i < currentTestimonial.rating ? "text-[#F4781B]" : "text-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Quote Text */}
            <ResponsiveParagraph size="lg" className=" text-[#252B37] leading-relaxed mb-8">
              {currentTestimonial.quote}
            </ResponsiveParagraph>

            {/* Author Info */}
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={currentTestimonial.avatar}
                  alt={currentTestimonial.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <Paragraph className="text-lg font-semibold text-[#252B37]">
                  {currentTestimonial.name}
                </Paragraph>
                <Paragraph className="text-sm text-[#717680]">
                  {currentTestimonial.role}
                </Paragraph>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={prevSlide}
          className="w-12 h-12 rounded-full border-2 border-neutral-100 flex items-center justify-center hover:bg-[#F4781B] hover:text-white transition-all group"
          aria-label="Previous testimonials"
        >
          <ArrowLeft className="w-6 h-6 text-[#F4781B] group-hover:text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="w-12 h-12 rounded-full border-2 border-neutral-100 flex items-center justify-center hover:bg-[#F4781B] hover:text-white transition-all group"
          aria-label="Next testimonials"
        >
          <ArrowRight className="w-6 h-6 text-[#F4781B] group-hover:text-white" />
        </button>
      </div>
    </Section>
  );
}
