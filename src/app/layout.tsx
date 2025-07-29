import "./globals.css";
import { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Instrument_Sans } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import VerificationCheck from "@/components/dashboard/VerificationCheck";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { IOSInstallPrompt } from "@/components/IOSInstallPrompt";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import GoogleOAuthWrapper from "@/components/shared/GoogleOAuthProvider";
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { color: "#2563eb", media: "(prefers-color-scheme: light)" },
    { color: "#2563eb", media: "(prefers-color-scheme: dark)" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pilox.com"),

  title: {
    default:
      "PILOX - Ultimate AI PDF Tools & Document Assistant | Free PDF Converter & Editor",
    template: "%s - PILOX",
  },
  description:
    "Transform documents with PILOX's AI-powered tools. Convert, edit, and analyze PDFs for free. Features LaTeX rendering, image conversion, document chat, quiz generation, and video explanations.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PILOX",
    startupImage: [
      {
        url: "/splash/apple-splash-2048-2732.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/apple-splash-1668-2388.png",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/apple-splash-1536-2048.png",
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/apple-splash-1125-2436.png",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/apple-splash-1242-2688.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/icons/192x192.png", sizes: "192x192" },
      { url: "/icons/512x512.png", sizes: "512x512" },
      { url: "/icons/152x152.png", sizes: "152x152" },
      { url: "/icons/120x120.png", sizes: "120x120" },
    ],
  },
  other: {
    "theme-color": "#2563eb",
    "msapplication-TileColor": "#2563eb",
    "msapplication-navbutton-color": "#2563eb",
    "apple-mobile-web-app-status-bar-style": "#2563eb",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.className} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PILOX" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className="">
        <NextTopLoader
          color="#2563eb"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
        />

        <ServiceWorkerRegistration />

        <VerificationCheck>
          <GoogleOAuthWrapper>
            <ClientLayout>{children}</ClientLayout>
          </GoogleOAuthWrapper>
        </VerificationCheck>

        <IOSInstallPrompt />
        <PWAInstallPrompt />

        <GoogleAnalytics />


        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
