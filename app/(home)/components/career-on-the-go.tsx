import Image from "next/image"
import { Section } from "@/components/ui/section"
import { Heading } from "@/components/ui/heading"
import { ResponsiveParagraph } from "@/components/ui/paragraph"

export default function CareerOnTheGo() {
  return (
    <Section backgroundColor="bg-neutral-100" className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 lg:gap-6 xl:gap-8" padding={false}>
        
        {/* Left Box */}
        <Section>
  <div className="space-y-4">
    <Heading as="h2" size="md" className="text-[#252B37] leading-tight">
      Your Career, Your Control{" "}
      <span className="text-[#F4781B]">On the Go.</span>{" "}
    </Heading>

    <ResponsiveParagraph size="base" className="text-[#717680] leading-relaxed">
      Get instant job alerts, apply with a single tap, and manage your entire job search — anytime, anywhere.
    </ResponsiveParagraph>
  </div>

  <div className="relative w-full max-w-2xl mx-auto flex justify-center gap-8 mt-10">
    {/* First QR code */}
    <Image
      src="/img/qr1.png"      // Change to your first QR code image path
      alt="QR Code 1"
      width={230}             // Half of 500 width (adjust as needed)
      height={500}            // Same aspect ratio maintained
      className="object-contain"
      priority
    />
    {/* Second QR code */}
    <Image
      src="/img/qr2.png"      // Change to your second QR code image path
      alt="QR Code 2"
      width={250}             // Same size as first
      height={500}
      className="object-contain"
      priority
    />
  </div>
</Section>

        {/* Right Box */}
        <Section padding={false} className="flex overflow-hidden items-end justify-end ">
          <div className="relative mt-10 max-w-2xl mx-auto">
            <Image 
              src="/img/phone-screen.png" 
              alt="Verified score card showing Dr. Noah Liam profile"
              width={500}
              height={900}
              className="object-contain"
              priority
            />
          </div>
        </Section>
    </Section>
  )
}
