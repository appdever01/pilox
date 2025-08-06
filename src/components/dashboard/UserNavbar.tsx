"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  AlignRight,
  X,
  FileText,
  Youtube,
  FileOutput,
  LogOut,
  Image as ImageIcon,
  ChevronDown,
  FileStack,
  BookOpen,
  History,
  Settings,
  Wallet,
  Sparkles,
  Shield,
  HelpCircle,
  MoreHorizontal,
  Gift,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import type { User } from "@/types/auth";
import AuthApiClient from "@/lib/auth-api-client";
import { API_ROUTES } from "@/lib/config";
import "react-toastify/dist/ReactToastify.css";
import { Navbar } from "../landing/Navbar";
import { ConnectWallet } from "../shared/ConnectWallet";

interface UserDetailsResponse {
  user: User;
  status: string;
  message: string;
  data: {
    user: User;
  };
}

export function UserNavbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((name) => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  useEffect(() => {
    const initUser = async () => {
      try {
        const response = await AuthApiClient.get<UserDetailsResponse>(
          `${API_ROUTES.USER_DETAILS}`
        );
        if (response.status === "success") {
          auth.updateUser(response.data.user);
          setUser(response.data.user);
        } else {
          auth.removeToken();
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        auth.removeToken();
      } finally {
        setIsLoading(false);
      }
    };
    initUser();
  }, []);

  if (isLoading || !user) {
    return <Navbar />;
  }

  const navItems = [
    {
      name: "Documents",
      type: "dropdown",
      items: [
        {
          name: "Generate PDF",
          href: "/generate-pdf",
          icon: FileText,
          isPro: true,
        },
        {
          name: "Chat with PDF",
          href: "/chat",
          icon: MessageSquare,
          isPro: true,
        },
        {
          name: "Rearrange PDF",
          href: "/rearrange-pdf",
          icon: FileStack,
          isPro: false,
        }
      ],
      icon: FileText,
    },
    {
      name: "Images",
      type: "dropdown",
      items: [
        {
          name: "Images to PDF",
          href: "/images-to-pdf",
          icon: ImageIcon,
          isPro: false,
        },
        {
          name: "PDF to Images",
          href: "/pdf-to-images",
          icon: FileOutput,
          isPro: false,
        },
      ],
      icon: ImageIcon,
    },
    {
      name: "Chat with Youtube",
      href: "/youtube-chat",
      icon: Youtube,
      isPro: true,
    },
    {
      name: "More",
      type: "dropdown",
      items: [
        { name: "Features", href: "/#features", icon: Sparkles, isPro: false },
        { name: "Pricing", href: "/pricing", icon: Wallet, isPro: false },
        { name: "FAQs", href: "/#faq", icon: HelpCircle, isPro: false },
        {
          name: "Privacy Policy",
          href: "/privacy",
          icon: Shield,
          isPro: false,
        },
      ],
      icon: MoreHorizontal,
    },
  ];

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    auth.removeToken();
    toast.success("Logged out successfully!");
    router.replace("/login");
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b bg-background lg:px-10 xl:px-20">
      <div className="container mx-auto px-2 sm:px-1">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center pl-2 sm:pl-0">
              <Image
                src="/logo.png"
                alt="PILOX Logo"
                width={80}
                height={26}
                priority
              />
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-2 lg:space-x-4">
            {navItems.map((item) =>
              item.type === "dropdown" ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {item.isPro && (
                      <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                        PRO
                      </span>
                    )}
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
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.isPro && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                      PRO
                    </span>
                  )}
                </Link>
              )
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ConnectWallet />
            <Link
              href="/pricing"
              className="flex px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary items-center gap-1 hover:bg-primary/20 transition-colors"
            >
              <Wallet className="w-4 h-4" />
              {new Intl.NumberFormat().format(user.credits || 0)}{" "}
              {user.credits &&
              user.credits.toString().length > 4 &&
              screen.width > 428
                ? "credits"
                : ""}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-xs cursor-pointer">
                {getInitials(user.name)}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium truncate">{user.name}</div>
                  <div className="text-muted-foreground truncate">
                    {user.email}
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <Link
                    href="/credit-history"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <History className="w-4 h-4" />
                    <span>Credit History</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/referrals"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Get Free Credits</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/feedback-history"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Feedback History</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden bg-accent"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <AlignRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed top-16 left-0 right-0 bg-background border-b py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
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
                          onClick={() => setIsMobileMenuOpen(false)}
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
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              )
            )}
            {/* Mobile Logout Button */}
            <button
              className="flex w-full items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
