"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget: () => void;
      showWidget: () => void;
    };
  }
}

export default function TawkWidget() {
  const pathname = usePathname();

  const allowedPaths = ["/", "/login", "/signup", "/forgot-password"];
  const shouldShowWidget = allowedPaths.includes(pathname);

  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://embed.tawk.to/67845e4949e2fd8dfe06757d/1iheh0k4a";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("referrerpolicy", "origin");
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const checkTawkAPI = () => {
      if (window.Tawk_API) {
        if (shouldShowWidget) {
          window.Tawk_API.showWidget();
        } else {
          window.Tawk_API.hideWidget();
        }
      } else {
        setTimeout(checkTawkAPI, 100);
      }
    };

    checkTawkAPI();
  }, [pathname, shouldShowWidget]);

  return null;
}
