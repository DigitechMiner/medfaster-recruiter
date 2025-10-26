'use client'

import Image from 'next/image'

export default function PaymentBanner() {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#E63946] px-8 py-16 lg:px-16 lg:py-20">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-7xl mx-auto">
        
        {/* Left Content */}
        <div className="space-y-8">
          {/* Logo */}
          <div className="mb-6">
            <Image
              src="/img/logo.png"
              alt="MedFaster"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>

          {/* Heading */}
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Manage <span className="font-light">Payments</span> Seamlessly
          </h2>

          {/* CTA Button */}
          <button className="group flex items-center gap-3 bg-white text-gray-800 px-8 py-4 rounded-full font-medium text-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            Book a Demo
            <span className="bg-[#F4781B] text-white p-2 rounded-full group-hover:rotate-12 transition-transform duration-300">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.162 1.628.947 1.847l1.819.464a1 1 0 01.754 1.165 2.5 2.5 0 01-4.843-.06l.817-2.551A1 1 0 005.91 13H3.75A1.75 1.75 0 012 11.25v-1.5A1.75 1.75 0 013.75 8h2.16a1 1 0 011.734.718z" />
              </svg>
            </span>
          </button>
        </div>

        {/* Right Content - Doctor Collage */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md lg:max-w-lg">
            <Image
              src="/img/doctor-group.png"
              alt="Healthcare Professionals"
              width={600}
              height={500}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Background Pattern/Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
      </div>
    </section>
  )
}
