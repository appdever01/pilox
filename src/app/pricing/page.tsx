"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center gap-3 text-lg font-medium">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary transition-colors duration-200"
            >
              Home
            </Link>
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <span className="text-gray-900 font-semibold">Pricing</span>
          </div>
        </div>
      </div>

      <Pricing />

      <FAQ />
    </div>
  );
}
