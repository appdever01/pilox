"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, WifiOff, ArrowLeft } from "lucide-react";

export default function OfflinePage() {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Update online status initially and when it changes
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsReconnecting(true);
    try {
      // Try to fetch a small resource to test connection
      const response = await fetch("/logo.png");
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      // If fetch fails, we're still offline
      setIsReconnecting(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-4 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [-10, 10, -10],
            y: [-10, 10, -10],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-4 -right-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
            x: [10, -10, 10],
            y: [10, -10, 10],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center space-y-8 bg-background/50 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-border/50">
          {/* Animated Icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center relative"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-md" />
            <WifiOff className="w-12 h-12 text-primary relative z-10" />
          </motion.div>

          {/* Title and Description */}
          <div className="space-y-3">
            <motion.h1
              className="text-4xl font-bold tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                You're Offline
              </span>
            </motion.h1>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {isOnline
                ? "Reconnected! Click retry to reload the page."
                : "Don't worry! Sometimes the best connections need a quick reset."}
            </p>
          </div>

          {/* Status Indicator */}
          <motion.div
            className="flex items-center justify-center gap-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-primary" : "bg-primary/50"
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {isOnline ? "Connected" : "No Connection"}
            </span>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRetry}
              disabled={isReconnecting}
              className="w-full gap-2 bg-primary hover:bg-primary/90 transition-all duration-300 ease-in-out"
            >
              <motion.div
                animate={isReconnecting ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
              {isReconnecting ? "Checking Connection..." : "Retry Connection"}
            </Button>

            <Button
              onClick={goBack}
              variant="outline"
              className="w-full gap-2 hover:bg-primary/10 transition-all duration-300 ease-in-out"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
