"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Zap, Shield, Sparkles, Star } from "lucide-react";

export function WhyChooseUs() {
  const [contentHeight, setContentHeight] = useState(0);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const updateHeight = () => {
      if (leftColumnRef.current) {
        setContentHeight(leftColumnRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description:
        "Your documents are protected with top-tier security. No permanent storage for non-signed-in users and enterprise-level data protection.",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Intelligence",
      description:
        "Experience next-gen document analysis with our advanced AI. From complex layouts to scanned documents, we handle it all effortlessly.",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      icon: FileText,
      title: "Comprehensive Tools",
      description:
        "Access a complete suite of document tools - from smart PDF viewing to format conversion, all designed for maximum efficiency.",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      icon: Zap,
      title: "Pay As You Grow",
      description:
        "Start with powerful free features and scale with our flexible credit-based system. Get 2 free credits daily to try premium features.",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
  ];

  return (
    <section
      className="relative py-12 bg-white lg:px-20 xl:px-32 z-10"
      id="features"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white -z-10" />

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-20">
          <div ref={leftColumnRef} className="relative w-full lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              <span>Why Choose Us</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by Over{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                10,000 Users
              </span>
            </h2>

            <p className="text-gray-600 text-lg mb-12">
              Join thousands of satisfied users who trust PDFX for their document processing needs. 
              Enterprise security meets AI innovation.
            </p>

            <div className="grid gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative bg-white rounded-2xl p-6 border border-gray-100
                           hover:border-emerald-100 transition-all duration-300
                           hover:shadow-[0_0_50px_-12px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex gap-6">
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.iconBg} 
                                  flex items-center justify-center shrink-0
                                  group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon
                        className={`w-6 h-6 ${feature.iconColor}`}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2">
            <div
              className="sticky top-20 hidden lg:block"
              style={{ height: contentHeight ? `${contentHeight}px` : "auto" }}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent" />
                <img
                  src="/feature_banner.jpg"
                  alt="PDFX Features"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              <div className="absolute -z-10 top-1/2 right-0 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
              <div className="absolute -z-10 bottom-0 left-1/2 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
