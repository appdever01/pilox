import { FAQ } from "@/components/landing/FAQ";
import { Hero } from "@/components/landing/Hero";
import { Pricing } from "@/components/Pricing";
import { Features } from "@/components/landing/Features";
import { Separator } from "@/components/Separator";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { Testimonials } from "@/components/landing/Testimonials";

export default function Page() {
  return (
    <main className="overflow-x-hidden flex flex-col bg-transparent">
      <Hero />
      <WhyChooseUs />
      <Features />
      <Separator color="gray" />
      <Pricing />
      <Separator />
      <Testimonials />
      <Separator />
      <FAQ />
    </main>
  );
}
