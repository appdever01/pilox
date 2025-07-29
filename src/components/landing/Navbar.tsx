"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  AlignRight,
  X,
  FileText,
  FileOutput,
  Image as ImageIcon,
  FileStack,
  Sparkles,
  ChevronDown,
  MessageSquare,
  Youtube,
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PWAInstallPrompt } from "../PWAInstallPrompt";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) {
      return hash === href.substring(1);
    }
    return pathname === href;
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((name) => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  const navItems = [
    {
      name: "Features",
      type: "dropdown",
      items: [
        { name: "Overview", href: "/#features", icon: Sparkles },
        { name: "PDF to Images", href: "/pdf-to-images", icon: FileOutput },
        { name: "Images to PDF", href: "/images-to-pdf", icon: ImageIcon },
        { name: "Rearrange PDF", href: "/rearrange-pdf", icon: FileStack },
        {
          name: "Convert Document",
          href: "/convert-documents",
          icon: FileStack,
        },
        { name: "LaTeX Renderer", href: "/latex-renderer", icon: FileText },
        {
          name: "Chat with PDF",
          href: "/login",
          icon: MessageSquare,
          isPro: true,
        },
        { name: "Generate PDF", href: "/login", icon: FileText, isPro: true },
        {
          name: "Chat with Youtube",
          href: "/login",
          icon: Youtube,
          isPro: true,
        },
      ],
      icon: Sparkles,
    },

    { name: "Pricing", href: "/pricing" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "FAQs", href: "/#faq" },
  ];

  return (
    <nav
      className="fixed top-0 w-full z-50 border-b bg-background
      lg:px-10 xl:px-20"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 pl-2">
            <Image
              src="/logo.png"
              alt="PDFX Logo"
              width={80}
              height={26}
              priority
            />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) =>
              item.type === "dropdown" ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="cursor-pointer">
                    {item.items.map((subItem) => (
                      <DropdownMenuItem key={subItem.name} asChild>
                        <Link
                          href={subItem.href}
                          className="flex items-center space-x-2 w-full"
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.name}</span>
                          {subItem.isPro && (
                            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                              PRO
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  href={item.href || "#"}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href || "#")
                      ? "text-[#2563eb]"
                      : "text-muted-foreground hover:text-[#2563eb]"
                  }`}
                >
                  {item.name}
                </Link>
              )
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300"
              >
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="rounded-full bg-gradient-to-r from-primary to-primary/50 hover:from-primary/90 hover:to-primary/40 transition-all duration-300">
                Sign up
              </Button>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden bg-accent"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <AlignRight className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed top-16 left-0 right-0 bg-background border-b py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {navItems.map((item) =>
              item.type === "dropdown" ? (
                <div key={item.name} className="px-4">
                  <button
                    onClick={() => toggleSection(item.name)}
                    className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground py-2"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedSections.includes(item.name) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.includes(item.name) && (
                    <div className="pl-6 space-y-2 mt-2">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary rounded-lg hover:bg-accent/50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.name}</span>
                          {subItem.isPro && (
                            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                              PRO
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href || "#"}
                  className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            )}
            <div className="border-t pt-4 px-4 space-y-2">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full py-5">
                  Log in
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                <Button size="sm" className="w-full py-5">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        )}
        <PWAInstallPrompt />
      </div>
    </nav>
  );
}
