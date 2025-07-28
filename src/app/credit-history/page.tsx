"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { API_ROUTES } from "@/lib/config";
import AuthApiClient from "@/lib/auth-api-client";
import { toast } from "sonner";

interface CreditHistory {
  _id: string;
  credits: number;
  type: "credit" | "debit";
  description: string;
  status: string;
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

export default function CreditHistoryPage() {
  const [history, setHistory] = useState<CreditHistory[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 10;

  const fetchHistory = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await AuthApiClient.get<{
        status: string;
        message: string;
        data: any;
      }>(API_ROUTES.CREDIT_HISTORY, {
        page: page.toString(),
        limit: "10",
      });
      if (data.status === "success") {
        setHistory(data.data.history);
        setPagination(data.data.pagination);
      }
    } catch (error: any) {
      toast.error(error.message || "Error fetching credit history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Credit History</h1>
          <p className="text-muted-foreground mt-2">
            Track your credit usage and purchases
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  Array.from({ length: limit }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-32" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-48" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-20" />
                      </td>
                    </tr>
                  ))
                ) : history.length > 0 ? (
                  history.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground/70" />
                          <span className="text-sm text-muted-foreground">
                            {format(
                              new Date(item.createdAt),
                              "MMM d, yyyy h:mm a"
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium">
                          {item.description}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.type === "credit"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium">
                          {item.credits}{" "}
                          {item.credits === 1 ? "credit" : "credits"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.status === "pending"
                              ? "bg-yellow-50 text-yellow-700"
                              : item.status === "failed"
                                ? "bg-red-50 text-red-700"
                                : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col whitespace-nowrap items-center gap-2">
                        <Clock className="w-8 h-8" />
                        <p>No credit history available</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * limit + 1} to{" "}
                {Math.min(pagination.page * limit, pagination.total)} of{" "}
                {pagination.total} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage || isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage || isLoading}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

