"use client"

import { useState } from 'react'
import Image from 'next/image'
import { FaStar } from 'react-icons/fa'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { ArrowBigLeft, ArrowLeft, ArrowRight } from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  role: string
  image: string
  rating: number
  review: string
}

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah M.",
      role: "Registered Nurse",
      image: "/img/testimonials/sarah.png",
      rating: 5,
      review: "Got a part-time nursing job in 2 days — everything was verified! The smart job recommendations saved me so much time. Highly recommend it!"
    },
    {
      id: 2,
      name: "David L.",
      role: "Freelance Physiotherapist",
      image: "/img/testimonials/michael.png",
      rating: 5,
      review: "I had been looking for flexible shifts with no luck. The easy payments and map view here made freelancing smooth. Totally worth it."
    },
    {
      id: 3,
      name: "Emily R.",
      role: "Healthcare Specialist",
      image: "/img/testimonials/sarah.png",
      rating: 5,
      review: "The AI matching is incredible! Found my dream job within a week. The verification process gave me confidence in every application."
    },
    {
      id: 4,
      name: "Michael K.",
      role: "Medical Technician",
      image: "/img/testimonials/michael.png",
      rating: 5,
      review: "Best platform for healthcare professionals! The instant notifications and easy application process made job hunting stress-free."
    }
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 2 >= testimonials.length ? 0 : prev + 2))
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 2 < 0 ? testimonials.length - 2 : prev - 2))
  }

  return (
    <section className="w-full py-16 px-4 md:px-8 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#252B37] mb-4">
            What Our Professionals Are Saying About{" "}
            <span className="text-[#F4781B]">MeDFasterrrrr</span>
          </h2>
          <p className="text-base md:text-lg text-[#717680] max-w-3xl">
            Real experiences from nurses, specialists, and therapists who found success on our platform. 
            See how we've helped thousands find their ideal roles.
          </p>
        </div>

      {/* Testimonials Grid */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
  {testimonials.slice(currentIndex, currentIndex + 2).map((testimonial) => (
    <div
      key={testimonial.id}
      className="bg-white  rounded-2xl p-8  flex flex-col"
    >
      {/* Star Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <FaStar key={i} className="w-5 h-5 text-[#F4781B]" />
        ))}
      </div>

      {/* Review Text - flex-1 pushes user info to bottom */}
      <p className="text-base md:text-lg text-[#252B37] mb-6 leading-relaxed flex-1">
        "{testimonial.review}"
      </p>

      {/* User Info - stays at bottom */}
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="font-semibold text-[#252B37]">{testimonial.name}</h4>
          <p className="text-sm text-[#717680]">{testimonial.role}</p>
        </div>
      </div>
    </div>
  ))}
</div>


        {/* Navigation Arrows */}
        <div className="flex gap-4">
          <button
            onClick={prevTestimonial}
            className="w-12 h-12 rounded-full border-2 border-neutral-100 flex items-center justify-center hover:bg-[#F4781B] hover:text-white transition-all group"
            aria-label="Previous testimonials"
          >
            <ArrowLeft className="w-6 h-6 text-[#F4781B] group-hover:text-white" />
          </button>
          <button
            onClick={nextTestimonial}
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
