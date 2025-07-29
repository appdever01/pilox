"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, ChevronLeft, ChevronRight, Loader2, Coins, CheckCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import AuthApiClient from "@/lib/auth-api-client";
import { API_ROUTES } from "@/lib/config";
import { Skeleton } from "@/components/ui/skeleton";

interface FeedbackHistory {
  _id: string;
  type: string;
  title: string;
  priority: string;
  createdAt: string;
  rewarded: boolean;
  rewardAmount: number;
  status: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function FeedbackHistoryPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackHistory[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [totalCreditsEarned, setTotalCreditsEarned] = useState(0);
  const [totalRewarded, setTotalRewarded] = useState(0);
  const limit = 10;

  const fetchFeedbackHistory = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await AuthApiClient.get<{
        status: string;
        message: string;
        data: {
          feedbacks: FeedbackHistory[];
          pagination: PaginationInfo;
        };
      }>(API_ROUTES.FEEDBACK_HISTORY, {
        page: page.toString(),
        limit: limit.toString(),
      });

      if (response.status === "success") {
        setFeedbacks(response.data.feedbacks);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to load feedback history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackHistory(currentPage);
    fetchFeedbackDetails();
  }, []);

  useEffect(() => {
    fetchFeedbackHistory(currentPage);
  }, [currentPage]);  

  const fetchFeedbackDetails = async () => {
    setIsLoadingData(true);
    try {
      const data = await AuthApiClient.get<{
        status: string;
        message: string;
        data: {
          totalSubmissions: number;
          totalCreditsEarned: number;
          totalRewarded: number;
        };
      }>(API_ROUTES.FEEDBACK_DATA);
      if (data.status === "success") {
        setTotalSubmissions(data.data.totalSubmissions);
        setTotalCreditsEarned(data.data.totalCreditsEarned);
        setTotalRewarded(data.data.totalRewarded);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to load feedback details");
    } finally {
      setIsLoadingData(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Feedback History</h1>
            <p className="text-muted-foreground mt-2">
              Track your submitted feedback and bug reports
            </p>
          </div>
          <Link href="/feedback">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Bug Report
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isLoadingData ? (
            <>
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Submissions</p>
                    <p className="text-2xl font-bold">{pagination?.total || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Coins className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credits Earned</p>
                    <p className="text-2xl font-bold">
                      {feedbacks.filter(f => f.rewarded).length * 10}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Approved Reports</p>
                    <p className="text-2xl font-bold">
                      {feedbacks.filter(f => f.status === "verified").length}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Credits
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  Array.from({ length: limit }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-32" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-32" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-20" />
                      </td>
                    </tr>
                  ))
                ) : feedbacks.length > 0 ? (
                  feedbacks.map((feedback) => (
                    <tr
                      key={feedback._id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            feedback.type === "bug"
                              ? "bg-red-50 text-red-700"
                              : feedback.type === "feature"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          {feedback.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium line-clamp-1">{feedback.title}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            feedback.priority === "high"
                              ? "bg-red-50 text-red-700"
                              : feedback.priority === "medium"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {feedback.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            feedback.status === "pending"
                              ? "bg-yellow-50 text-yellow-700"
                              : feedback.status === "verified"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {feedback.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        <time dateTime={feedback.createdAt}>
                          {format(new Date(feedback.createdAt), "MMM d, yyyy h:mm a")}
                        </time>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {feedback.rewarded ? (
                          <span className="text-xs font-medium text-blue-600">
                            +{feedback.rewardAmount} credits
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      <p>No feedback history available</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="px-4 py-3 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground order-2 sm:order-1">
                {feedbacks.length > 0 ? (
                  <>
                    Showing {(currentPage - 1) * limit + 1} to{" "}
                    {Math.min(currentPage * limit, pagination.total)} of{" "}
                    {pagination.total} entries
                  </>
                ) : (
                  "Showing 0 entries"
                )}
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage || isLoading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage || isLoading}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}