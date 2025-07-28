"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faXTwitter,
  faInstagram,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { API_BASE_URL, API_ROUTES } from "@/lib/config";

const footerSections = {
  tools: [
    { name: "Smart PDF Viewer", href: "/pdf-viewer" },
    { name: "PDF Chat", href: "/chat" },
    { name: "PDF ↔ Images", href: "/pdf-to-images" },
    { name: "AI PDF Generator", href: "/generate-pdf" },
    { name: "Document Converter", href: "/convert-documents" },
    { name: "YouTube Chat", href: "/youtube-chat" },
    { name: "LaTeX Renderer", href: "/latex-renderer" },
  ],

  legal: [
    { name: "Pricing", href: "/#pricing" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Support", href: "mailto:support@pdfx.chat" },
  ],
};

export function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ROUTES.NEWSLETTER_SUBSCRIBE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }
      const data = await response.json();
      if (data.status === "success") {
        toast.success(data.message || "Thank you for subscribing!");
        setEmail("");
      } else {
        throw new Error(data.message || "Failed to subscribe");
      }
    } catch (error: any) {
      toast.error(
        error.message || "Something went wrong. Please try again later."
      );
      console.error("Newsletter subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-black text-white py-16 lg:px-10 xl:px-20 px-2">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-16">
          <div className="mb-12 lg:mb-0">
            <div className="flex items-center gap-2 mb-6">
              <Image
                src="/logo_white.png"
                alt="PDFX Logo"
                width={100}
                height={20}
              />
            </div>

            <p className="text-gray-500 max-w-md mb-8">
              Transform your documents with AI-powered intelligence. PDFX
              delivers advanced PDF tools for seamless document management.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="bg-[#111111] rounded-full px-6 py-3 flex-shrink-0">
                <a
                  href="mailto:support@pdfx.chat"
                  className="text-gray-300 whitespace-nowrap"
                >
                  support@pdfx.chat
                </a>
              </div>
              <div className="bg-[#111111] rounded-full px-6 py-3 flex-shrink-0">
                <a
                  href="mailto:hello@pdfx.chat"
                  className="text-gray-300 whitespace-nowrap"
                >
                  hello@pdfx.chat
                </a>
              </div>
            </div>
          </div>

          <div className="lg:max-w-md w-full">
            <h3 className="text-xl mb-6">Stay updated with PDFX</h3>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-full bg-[#111111] border-none text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/50"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white font-medium py-4 rounded-full hover:bg-emerald-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="h-px bg-gray-800 mb-16"></div>

        <div className="flex flex-col-reverse md:flex-row justify-between">
          <div className="mt-8 md:mt-0">
            <div className="flex gap-4">
              {[
                {
                  icon: faFacebookF,
                  href: "https://www.facebook.com/profile.php?id=61571592123557&mibextid=ZbWKwL",
                },
                { icon: faXTwitter, href: "https://x.com/pdfx_chat" },
                { icon: faInstagram, href: "https://instagram.com/pdfx.chat" },
                {
                  icon: faLinkedinIn,
                  href: "https://ng.linkedin.com/company/tekcify",
                },
              ].map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={social.icon} className="h-5 w-5" />
                </Link>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-8">
              © {new Date().getFullYear()} Tekcify. All rights reserved.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
            <div>
              <h3 className="text-lg font-medium mb-6">Tools</h3>
              <ul className="space-y-4">
                {footerSections.tools.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-6">Legal</h3>
              <ul className="space-y-4">
                {footerSections.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
