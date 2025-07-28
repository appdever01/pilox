import { useEffect } from "react";

const useInstallPrompt = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && "onbeforeinstallprompt" in window) {
      let deferredPrompt: any;

      const handleBeforeInstallPrompt = (event: any) => {
        event.preventDefault();
        deferredPrompt = event;

        // Trigger your custom install prompt
        showInstallPrompt();
      };

      const showInstallPrompt = () => {
        // Customize your install prompt here
        if (deferredPrompt) {
          // Your custom logic or UI for install prompt
          console.log("Show your custom install prompt");
        }
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    }
  }, []); // Empty dependency array ensures this effect runs only once on mount
};

export default useInstallPrompt;
