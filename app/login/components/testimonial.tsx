'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function TestimonialsSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const testimonials = [
    {
      quote: "The promise of 100% verified healthcare staff is real. We've had zero compliance issues since switching over, which gives our entire team peace of mind. Totally worth it.",
      name: "Maria R.",
      role: "Compliance Officer",
      avatar: "/img/testimonials/michael.png",
      rating: 5
    },
    {
      quote: "MedFaster cut our hiring time from 6 weeks to just 10 days. The AI matching is incredibly accurate and saves us countless hours of screening.",
      name: "Dr. James Chen",
      role: "Chief Medical Officer",
      avatar: "/img/testimonials/sarah.png",
      rating: 5
    },
    {
      quote: "Finally, a platform that understands healthcare recruitment. The credential verification alone is worth the investment.",
      name: "Sarah Mitchell",
      role: "HR Director",
      avatar: "/img/testimonials/sarah.png",
      rating: 5
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const currentTestimonial = testimonials[currentSlide]

  return (
    <section className="w-full bg-white py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="text-left mb-12 lg:mb-16">
          <h2 className="text-4xl lg:text-5xl font-normal text-[#252B37] mb-4">
            Why Leading Hospitals Trust{' '}
            <span className="text-[#F4781B] font-semibold">MeDFasterrrr</span>
          </h2>
          <p className="text-[#717680] text-base lg:text-lg max-w-3xl">
            Real results from healthcare partners who have transformed their hiring process. See how we help them save time, ensure compliance, and hire top-tier talent.
          </p>
        </div>

        {/* Testimonial Card - No Border */}
        <div className="relative bg-white p-8 lg:p-12">
          
          {/* Star Rating */}
          <div className="flex gap-1 mb-6">
            {[...Array(currentTestimonial.rating)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-[#F4781B]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Quote Icon and Text */}
          <div className="mb-8">
            <div className="flex items-start gap-4">
              <span className="text-6xl text-[#F4781B] font-serif leading-none">"</span>
              <p className="text-2xl lg:text-3xl text-[#252B37] leading-relaxed">
                {currentTestimonial.quote}
              </p>
            </div>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-4">
            <Image
              src={currentTestimonial.avatar}
              alt={currentTestimonial.name}
              width={56}
              height={56}
              className="rounded-full"
            />
            <div>
              <p className="text-lg font-semibold text-[#252B37]">
                {currentTestimonial.name}
              </p>
              <p className="text-sm text-[#717680]">
                {currentTestimonial.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Arrows Only */}
        <div className="flex gap-4">
          <button
            onClick={prevSlide}
            className="w-12 h-12 rounded-full border-2 border-neutral-100 flex items-center justify-center hover:bg-[#F4781B] hover:text-white transition-all group"
            aria-label="Previous testimonials"
          >
            <ArrowLeft className="w-6 h-6 text-[#F4781B] group-hover:text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="w-12 h-12 rounded-full border-2 border-roubd border-neutral-100 flex items-center justify-center hover:bg-[#F4781B] hover:text-white transition-all group"
            aria-label="Next testimonials"
          >
            <ArrowRight className="w-6 h-6 text-[#F4781B] group-hover:text-white" />
          </button>
        </div>
      </div>
    </section>
  )
}
