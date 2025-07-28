"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { Share, X } from "lucide-react";
import { useState, useEffect } from "react";
// import logo from "../../public/icons/72x72.png";
import { motion, AnimatePresence } from "framer-motion";
export function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    // Check if it's Safari (iOS Chrome still uses WebKit)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    // Check if running as standalone
    const isStandalone = (window.navigator as any).standalone;

    setShowPrompt(isIOS && isSafari && !isStandalone);
  }, []);

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:max-w-md mx-auto"
      >
        <div className="relative bg-background/50 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-border/50">
          {/* Background blur effects */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          </div>

          {/* Content */}
          <div className="relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPrompt(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Icon */}
            <div className="mb-4">
              <figure className="w-12 h-12 flex items-center justify-center">
                <img
                  src="/icons/72x72.png"
                  className="w-full h-full"
                  draggable={false}
                  alt="PDFX Icon"
                />
              </figure>
            </div>

            {/* Text */}
            <div className="space-y-2 mb-6">
              <h3 className="font-semibold text-lg">
                Install PDFX on your iPhone
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get the full app experience! Tap the share button
                <Share className="w-4 h-4 inline mx-1 text-primary" />
                below, then select &quot;Add to Home Screen&quot;
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  1
                </div>
                <span>Tap the share button in Safari</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  2
                </div>
                <span>Scroll and tap &quot;Add to Home Screen&quot;</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  3
                </div>
                <span>Tap &quot;Add&quot; to install PDFX</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPrompt(false)}
              >
                Maybe Later
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => setShowPrompt(false)}
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
