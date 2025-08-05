"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Clock, Gift, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ClaimHistory {
  _id: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  timestamp: string;
  transactionHash: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ClaimHistoryPage() {
  const [history, setHistory] = useState<ClaimHistory[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    const simulateLoading = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockHistory: ClaimHistory[] = Array.from({ length: limit }).map((_, i) => ({
        _id: `claim-${i}`,
        amount: 1000,
        status: ["completed", "pending", "failed"][Math.floor(Math.random() * 3)] as any,
        timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        transactionHash: `0x${Array.from({ length: 64 }).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
      }));

      setHistory(mockHistory);
      setPagination({
        total: 50,
        page: currentPage,
        totalPages: 5,
        limit,
        hasNextPage: currentPage < 5,
        hasPrevPage: currentPage > 1
      });
      setIsLoading(false);
    };

    simulateLoading();
  }, [currentPage]);

  const viewTransaction = (hash: string) => {
    window.open(`https://explorer.educhain.network/tx/${hash}`, '_blank');
  };

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Claim History</h1>
          <p className="text-muted-foreground mt-2">
            Track your $PILOX token claims on EDUChain Network
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
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Transaction
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Action
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
                        <Skeleton className="h-6 w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-32" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-8 w-28" />
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
                              new Date(item.timestamp),
                              "MMM d, yyyy h:mm a"
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium">
                          {item.amount.toLocaleString()} $PILOX
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="text-sm text-muted-foreground hover:text-primary transition-colors">
                              {formatTxHash(item.transactionHash)}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-mono text-xs">{item.transactionHash}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewTransaction(item.transactionHash)}
                          className="text-xs hover:bg-primary/5 text-primary"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View on Explorer
                        </Button>
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
                        <Gift className="w-8 h-8" />
                        <p>No claims yet</p>
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