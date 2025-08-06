"use client";

import {
  Users,
  Copy,
  CheckCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/auth";
import { format } from "date-fns";
import { API_ROUTES } from "@/lib/config";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AuthApiClient from "@/lib/auth-api-client";
import { Skeleton } from "@/components/ui/skeleton";

interface ReferralDetails {
  total_referrals: number;
  total_credits: number;
}

interface Referral {
  name: string;
  referralCredit: number;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
interface ReferralHistoryResponse {
  status: string;
  message: string;
  data: {
    history: Referral[];
    pagination: PaginationInfo;
  };
}

const ITEMS_PER_PAGE = 10;

export default function ReferralsPage() {
  const user = auth.getUser();
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralDetails, setReferralDetails] =
    useState<ReferralDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [messageCopied, setMessageCopied] = useState(false);

  const referralCode = user?.referralCode || "";
  const referralLink = `https://pilox.com.ng/signup/${referralCode}`;

  const referralMessage = `🚀 Discover pilox.com - Your All-in-One Document AI Assistant!

Unlock powerful features:
✨ Smart PDF Chat - Get instant answers from any document
🎥 YouTube Video Chat - Chat with any YouTube video content
🎯 Auto-Generated Quizzes - Test your understanding
🎬 AI Video Explanations - Learn complex topics easily
📱 Mobile-Friendly Interface - Access anywhere and many more!

Join me on this AI-powered learning journey! Use my referral code "${referralCode}" to get started: ${referralLink}

#AI #Learning #PDFTools`;

  useEffect(() => {
    fetchReferralDetails();
    fetchReferralHistory();
  }, []);

  useEffect(() => {
    fetchReferralHistory();
  }, [currentPage]);

  const fetchReferralDetails = async () => {
    try {
      const data = await AuthApiClient.get<{
        status: string;
        message: string;
        data: ReferralDetails;
      }>(API_ROUTES.REFERRAL_DETAILS);
      if (data.status === "success") {
        setReferralDetails(data.data);
      }
    } catch (err) {
      toast.error("Failed to load referral details");
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await AuthApiClient.get<ReferralHistoryResponse>(
        API_ROUTES.REFERRAL_HISTORY,
        {
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        }
      );
      if (data.status === "success") {
        setReferrals(data.data.history);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      toast.error("Failed to load referral history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy referral link");
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCodeCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy referral code");
    }
  };

  const copyReferralMessage = async () => {
    try {
      await navigator.clipboard.writeText(referralMessage);
      setMessageCopied(true);
      toast.success("Referral message copied!");
      setTimeout(() => setMessageCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy referral message");
    }
  };

  const shareReferral = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join me on pilox.com.ng",
          text: referralMessage,
          url: referralLink,
        });
      } else {
        toast.info("Sharing is not supported on your device");
      }
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Get Free Credits</h1>
          <p className="text-muted-foreground mt-2">
            Share your referral link and earn credits when others sign up!
          </p>
        </div>

        <div className="grid gap-6">
          <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden p-6">
            <div className="grid grid-cols-2 gap-6">
              {loading ? (
                <>
                  <Skeleton className="h-[120px] rounded-xl" />
                  <Skeleton className="h-[120px] rounded-xl" />
                </>
              ) : (
                <>
                  <div className="p-6 bg-primary/5 rounded-xl border border-primary/10">
                    <div className="flex flex-col-reverse md:flex-row md:items-center justify-between mb-2">
                      <h3 className="text-xs md:text-base font-medium">
                        Total Referrals
                      </h3>
                      <span className="text-3xl font-bold text-primary">
                        {referralDetails?.total_referrals || 0}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      People who joined using your referral
                    </p>
                  </div>

                  <div className="p-6 bg-blue-50/30 rounded-xl border border-blue-100">
                    <div className="flex flex-col-reverse md:flex-row md:items-center justify-between mb-2">
                      <h3 className="text-xs md:text-base font-medium">
                        Credits Earned
                      </h3>
                      <span className="text-3xl font-bold text-blue-600">
                        {referralDetails?.total_credits || 0}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total credits earned from referrals
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden p-6 space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Your Referral Link</Label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="bg-muted font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralLink}
                  >
                    {copied ? (
                      <CheckCheck className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Referral Code</Label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Input
                    value={referralCode}
                    readOnly
                    className="bg-muted font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralCode}
                  >
                    {codeCopied ? (
                      <CheckCheck className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Referral Message</Label>
                <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                  <textarea
                    value={referralMessage}
                    readOnly
                    className="bg-muted font-mono min-h-[200px] resize-none py-2 px-3 rounded-md border border-input"
                    style={{ alignItems: "start" }}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralMessage}
                  >
                    {messageCopied ? (
                      <CheckCheck className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="icon" onClick={shareReferral}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Referral History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/50">
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Credits Earned
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Joined Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {loadingHistory ? (
                      Array(3)
                        .fill(0)
                        .map((_, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4">
                              <Skeleton className="h-6 w-32" />
                            </td>
                            <td className="px-6 py-4">
                              <Skeleton className="h-6 w-24" />
                            </td>
                            <td className="px-6 py-4">
                              <Skeleton className="h-6 w-32" />
                            </td>
                          </tr>
                        ))
                    ) : referrals.length > 0 ? (
                      referrals.map((referral, index) => (
                        <tr
                          key={index}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium">
                              {referral.name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {referral.referralCredit} credits
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground/70" />
                              <span className="text-sm whitespace-nowrap text-muted-foreground">
                                {format(
                                  new Date(referral.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Clock className="w-8 h-8" />
                            <p>No referrals yet</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {pagination && (
                <div className="mt-4  flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)}{" "}
                    of {pagination.total} referrals
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1 || loadingHistory}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={
                        referrals.length < ITEMS_PER_PAGE || loadingHistory
                      }
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
