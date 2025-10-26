import Image from 'next/image'
import React from 'react'
import { CustomButton } from "@/components/ui/custom-button";
import { ArrowRight, Download } from 'lucide-react';

const NextCareer = () => {
  return (
<section 
      className="w-full relative rounded-lg md:rounded-xl lg:rounded-2xl xl:rounded-3xl bg-[#F4781B] overflow-hidden p-4 md:p-8 lg:p-1"
      style={{
        backgroundImage: "url(/img/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    > <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
        
        {/* Left Side - Content */}
        <div className="p-8 md:p-12 lg:p-14 flex flex-col justify-center">
          <div className="space-y-6 ">
             <h1 className="text-4xl md:text-4xl lg:text-5xl font-semibold text-white tracking-widest whitespace-nowrap">
    Your Next Career Move Starts Here.
  </h1>
            
            <p className="text-base md:text-lg text-white/90 max-w-xl leading-relaxed">
              Join now to get access to verified listings, instant matches, and a network that's invested in your success.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <CustomButton
              className="bg-white text-black hover:bg-gray-100"
              rightIcon={ArrowRight}
              iconClassName="text-white"
              iconContainerClassName="bg-[#F4781B]"
            >
              Get Started
            </CustomButton>
              
               <CustomButton
              className="bg-white text-black hover:bg-gray-100"
              rightIcon={Download}
              iconClassName="text-white"
              iconContainerClassName="bg-[#F4781B]"
            >
              Download app
            </CustomButton>
            </div>
          </div>
        </div>

        {/* Right Side - Nurse Image */}
        <div className="relative flex items-end justify-center lg:justify-end">
          <div className="relative w-full h-[400px] lg:h-full">
            <Image 
              src="/img/nurse.png" 
              alt="Healthcare professional"
              fill
              className="object-contain object-bottom lg:object-right-bottom scale-x-[-1]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default NextCareer
