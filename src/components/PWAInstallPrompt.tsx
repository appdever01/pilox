"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { createPortal } from "react-dom";

export function PWAInstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    setMounted(true);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      console.log("PWA is already installed");
      return;
    }

    const handler = (e: Event) => {
      console.log("beforeinstallprompt event fired");
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    // Check if it's iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      console.log(
        "iOS detected - native install prompt will be shown by Safari"
      );
      return;
    }

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", (e) => {
      console.log("PWA was installed");
      setShowInstallButton(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("No deferred prompt available");
      return;
    }

    try {
      console.log("Showing install prompt");
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);

      if (outcome === "accepted") {
        setShowInstallButton(false);
      }
    } catch (error) {
      console.error("Error showing install prompt:", error);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    console.log("Install prompt dismissed by user");
    setShowInstallButton(false);
  };

  if (!showInstallButton || !mounted) return null;

  const content = (
    <div
      style={{ zIndex: 2147483647 }}
      className="fixed bottom-4 left-4 right-4 bg-background p-4 rounded-lg shadow-lg md:max-w-md mx-auto border border-border/50 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <h3 className="font-semibold">Install PILOX App</h3>
          <p className="text-sm text-muted-foreground">
            Add PILOX to your home screen for quick access
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDismiss}>
            Later
          </Button>
          <Button onClick={handleInstallClick}>Install</Button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
