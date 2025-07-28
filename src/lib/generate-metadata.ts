import { Metadata } from "next";
import { seoConfig } from "./seo-config";

export function generateMetadata(path: string): Metadata {
  const routeConfig =
    seoConfig.routes[path as keyof typeof seoConfig.routes] ||
    seoConfig.default;

  return {
    metadataBase: new URL("https://pdfx.chat"),
    title: routeConfig.title,
    description: routeConfig.description,
    authors: [{ name: "Tekcify" }],
    creator: "Tekcify",
    publisher: "Tekcify",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: `https://pdfx.chat${path}`,
      siteName: "PDFX",
      title: routeConfig.title,
      description: routeConfig.description,
    },
    twitter: {
      card: "summary_large_image",
      title: routeConfig.title,
      description: routeConfig.description,
      creator: "@pdfx_chat",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
