"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-8xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
            404
          </h1>

          <h2 className="text-3xl font-semibold text-foreground">
            Page Not Found
          </h2>

          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          <div className="flex items-center justify-center gap-4 pt-6">
            <Button
              variant="outline"
              className="rounded-full group"
              onClick={() => window.history.back()}
            >
              <ArrowLeft
                className="w-4 h-4 mr-2 transition-transform duration-300 
                                group-hover:-translate-x-1"
              />
              Go Back
            </Button>

            <Link href="/" passHref>
              <Button className="rounded-full bg-emerald-600 hover:bg-emerald-500 group">
                <Home
                  className="w-4 h-4 mr-2 transition-transform duration-300 
                              group-hover:scale-110"
                />
                Home Page
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Grid Pattern Background */}
        <div className="absolute inset-0 -z-10 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>
    </div>
  );
}
