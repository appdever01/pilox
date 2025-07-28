export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    // Register the service worker
    navigator.serviceWorker.register("/sw.js").then(
      function (registration) {
        console.log(
          "Service Worker registration successful with scope: ",
          registration.scope
        );
      },
      function (err) {
        console.log("Service Worker registration failed: ", err);
      }
    );

    // Listen for controlling service worker changes
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }
}
