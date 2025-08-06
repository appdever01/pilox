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
import { toast } from "react-toastify";
import { useState } from "react";
import { API_BASE_URL, API_ROUTES } from "@/lib/config";



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
                src="/logo.png"
                alt="PILOX Logo"
                width={100}
                height={20}
              />
            </div>

            <p className="text-gray-500 max-w-md mb-8">
              Build blockchain‑native learning with AI. PILOX brings advanced PDF tools,
              optional IPFS storage, and verifiable credentials for courses and hackathons.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="bg-[#111111] rounded-full px-6 py-3 flex-shrink-0">
                <a
                  href="mailto:support@pilox.com"
                  className="text-gray-300 whitespace-nowrap"
                >
                  support@pilox.com
                </a>
              </div>
              <div className="bg-[#111111] rounded-full px-6 py-3 flex-shrink-0">
                <a
                  href="mailto:hello@pilox.com"
                  className="text-gray-300 whitespace-nowrap"
                >
                  hello@pilox.com
                </a>
              </div>
            </div>
          </div>

          <div className="lg:max-w-md w-full">
            <h3 className="text-xl mb-6">Stay updated with PILOX</h3>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email for AI + blockchain updates"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-full bg-[#111111] border-none text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-medium py-4 rounded-full hover:bg-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  href: "#",
                },
                { icon: faXTwitter, href: "#" },
                { icon: faInstagram, href: "#" },
                {
                  icon: faLinkedinIn,
                  href: "#",
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
              © {new Date().getFullYear()} PILOX. All rights reserved.
            </p>
          </div>

       
        </div>
      </div>
    </footer>
  );
}
