"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Youtube,
  TrendingUp,
  Search,
  CreditCard,
  Save,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  Coins,
  Globe2,
  Check,
  X,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  status: "active" | "inactive";
  lastLogin: Date;
  joinDate: Date;
  totalPdfAnalyzed: number;
  totalYoutubeQueries: number;
  country: string;
  referralCode: string;
  totalReferrals: number;
  totalReferralCredits: number;
  referrals: ReferralUser[];
  creditHistory: CreditHistory[];
}

interface ReferralUser {
  name: string;
  email: string;
  joinDate: Date;
  creditsEarned: number;
}

interface CountryMetric {
  country: string;
  userCount: number;
  percentage: number;
}

interface Metrics {
  totalUsers: number;
  activeUsers: number;
  totalPdfAnalyzed: number;
  totalYoutubeQueries: number;
  userGrowth: number;
  averageCreditsPerUser: number;
  totalCreditsIssued: number;
  totalReferrals: number;
  countryDistribution: CountryMetric[];
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  conversionRate: number;
  totalUniqueVisitors: number;
  monthlyRecurringRevenue: number;
}

interface CreditHistory {
  date: Date;
  description: string;
  type: "credit" | "debit";
  amount: number;
  status: "completed" | "pending" | "failed";
}

interface Feedback {
  id: string;
  type: "bug" | "feature" | "improvement";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "verified" | "rejected";
  steps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
  };
  submittedAt: Date;
  creditsAwarded: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalPdfAnalyzed: 0,
    totalYoutubeQueries: 0,
    userGrowth: 0,
    averageCreditsPerUser: 0,
    totalCreditsIssued: 0,
    totalReferrals: 0,
    countryDistribution: [],
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,
    conversionRate: 0,
    totalUniqueVisitors: 0,
    monthlyRecurringRevenue: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCountryExpanded, setIsCountryExpanded] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showFeedbacks, setShowFeedbacks] = useState(false);
  const [feedbackMetrics, setFeedbackMetrics] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  });

  useEffect(() => {
    // In a real app, fetch data from your API
    fetchMetrics();
    fetchUsers();
    fetchFeedbacks();
  }, []);

  const fetchMetrics = async () => {
    // Simulate API call
    setTimeout(() => {
      setMetrics({
        totalUsers: 1234,
        activeUsers: 892,
        totalPdfAnalyzed: 5678,
        totalYoutubeQueries: 3456,
        userGrowth: 23.5,
        averageCreditsPerUser: 45.2,
        totalCreditsIssued: 56000,
        totalReferrals: 345,
        countryDistribution: [
          { country: "Nigeria", userCount: 450, percentage: 36.5 },
          { country: "United States", userCount: 280, percentage: 22.7 },
          { country: "United Kingdom", userCount: 175, percentage: 14.2 },
          { country: "India", userCount: 120, percentage: 9.7 },
          { country: "Canada", userCount: 89, percentage: 7.2 },
          { country: "Australia", userCount: 65, percentage: 5.3 },
          { country: "Germany", userCount: 55, percentage: 4.4 },
        ],
        weeklyActiveUsers: 567,
        monthlyActiveUsers: 789,
        conversionRate: 12.5,
        totalUniqueVisitors: 8234,
        monthlyRecurringRevenue: 12450,
      });
    }, 1000);
  };

  const fetchUsers = async () => {
    // Simulate API call
    setTimeout(() => {
      const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        credits: Math.floor(Math.random() * 100),
        status: Math.random() > 0.2 ? "active" : "inactive",
        lastLogin: new Date(Date.now() - Math.random() * 10000000000),
        joinDate: new Date(Date.now() - Math.random() * 30000000000),
        totalPdfAnalyzed: Math.floor(Math.random() * 50),
        totalYoutubeQueries: Math.floor(Math.random() * 30),
        country: "USA",
        referralCode: `REF${i + 1}`,
        totalReferrals: 0,
        totalReferralCredits: 0,
        referrals: [],
        creditHistory: [
          {
            date: new Date(Date.now() - Math.random() * 10000000000),
            description: "Monthly credit bonus",
            type: "credit",
            amount: 50,
            status: "completed",
          },
          {
            date: new Date(Date.now() - Math.random() * 10000000000),
            description: "PDF analysis",
            type: "debit",
            amount: 2,
            status: "completed",
          },
          {
            date: new Date(Date.now() - Math.random() * 10000000000),
            description: "Referral bonus",
            type: "credit",
            amount: 25,
            status: "completed",
          },
        ],
      }));
      setUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  };

  const fetchFeedbacks = async () => {
    // Simulate API call
    setTimeout(() => {
      const mockFeedbacks: Feedback[] = Array.from({ length: 20 }, (_, i) => ({
        id: `feedback-${i + 1}`,
        type: ["bug", "feature", "improvement"][
          Math.floor(Math.random() * 3)
        ] as "bug" | "feature" | "improvement",
        title: `Test Feedback ${i + 1}`,
        description: "This is a test feedback description...",
        priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as
          | "low"
          | "medium"
          | "high",
        status: ["pending", "verified", "rejected"][
          Math.floor(Math.random() * 3)
        ] as "pending" | "verified" | "rejected",
        submittedBy: {
          id: `user-${i + 1}`,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
        },
        submittedAt: new Date(Date.now() - Math.random() * 10000000000),
        creditsAwarded: Math.random() > 0.5,
      }));

      setFeedbacks(mockFeedbacks);
      setFeedbackMetrics({
        total: mockFeedbacks.length,
        pending: mockFeedbacks.filter((f) => f.status === "pending").length,
        verified: mockFeedbacks.filter((f) => f.status === "verified").length,
        rejected: mockFeedbacks.filter((f) => f.status === "rejected").length,
      });
    }, 1000);
  };

  const handleUpdateCredits = async (
    userId: string,
    amount: number,
    type: "add" | "deduct"
  ) => {
    try {
      const finalAmount = type === "add" ? amount : -amount;
      // Make API call to update credits
      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, credits: user.credits + finalAmount }
            : user
        )
      );
      toast.success(
        `Credits ${type === "add" ? "added" : "deducted"} successfully!`
      );
    } catch (error) {
      toast.error("Failed to update credits");
    }
  };

  const handleBanUser = async (userId: string) => {
    const confirmed = await new Promise((resolve) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-4">
            <p>Are you sure you want to ban this user?</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => resolve(true)}
              >
                Confirm Ban
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => resolve(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ),
        { autoClose: false }
      );
    });

    if (confirmed) {
      try {
        // Make API call to ban user
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, status: "inactive" } : user
          )
        );
        toast.success("User banned successfully");
      } catch (error) {
        toast.error("Failed to ban user");
      }
    }
  };

  const handleVerifyFeedback = async (feedbackId: string) => {
    try {
      // Make API call to verify feedback and award credits
      setFeedbacks(
        feedbacks.map((feedback) =>
          feedback.id === feedbackId
            ? { ...feedback, status: "verified", creditsAwarded: true }
            : feedback
        )
      );
      toast.success("Feedback verified and credits awarded!");
    } catch (error) {
      toast.error("Failed to verify feedback");
    }
  };

  const handleRejectFeedback = async (feedbackId: string) => {
    try {
      // Make API call to reject feedback
      setFeedbacks(
        feedbacks.map((feedback) =>
          feedback.id === feedbackId
            ? { ...feedback, status: "rejected" }
            : feedback
        )
      );
      toast.success("Feedback rejected");
    } catch (error) {
      toast.error("Failed to reject feedback");
    }
  };

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === "all" || user.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof User];
      const bValue = b[sortBy as keyof User];
      return sortOrder === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
          ? 1
          : -1;
    });

  const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const MetricCard = ({ title, value, icon: Icon, trend }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl shadow-sm border border-border/50 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm ${trend > 0 ? "text-blue-500" : "text-red-500"}`}
          >
            {trend > 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold">{value.toLocaleString()}</h3>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
    </motion.div>
  );

  const CreditAdjustmentModal = ({
    isOpen,
    onClose,
    onConfirm,
    userId,
    currentCredits,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, type: "add" | "deduct") => void;
    userId: string;
    currentCredits: number;
  }) => {
    const [amount, setAmount] = useState(0);
    const [type, setType] = useState<"add" | "deduct">("add");

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adjust Credits</DialogTitle>
            <DialogDescription>
              Current balance: {currentCredits} credits
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Select
                value={type}
                onValueChange={(value: "add" | "deduct") => setType(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Credits</SelectItem>
                  <SelectItem value="deduct">Deduct Credits</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                className="w-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onConfirm(amount, type)}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const UserDetailsModal = ({
    user,
    isOpen,
    onClose,
  }: {
    user: User;
    isOpen: boolean;
    onClose: () => void;
  }) => {
    const [isReferralsExpanded, setIsReferralsExpanded] = useState(false);
    const [isCreditHistoryExpanded, setIsCreditHistoryExpanded] =
      useState(false);

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <p className="text-sm">{user.name}</p>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm">{user.email}</p>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <p className="text-sm">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === "active"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {user.status}
                </span>
              </p>
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <p className="text-sm">{user.country}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4">
            <MetricCard
              title="Total PDFs"
              value={user.totalPdfAnalyzed}
              icon={FileText}
            />
            <MetricCard
              title="YouTube Queries"
              value={user.totalYoutubeQueries}
              icon={Youtube}
            />
            <MetricCard
              title="Current Credits"
              value={user.credits}
              icon={CreditCard}
            />
          </div>

          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Referral Information</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReferralsExpanded(!isReferralsExpanded)}
              >
                {isReferralsExpanded ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>

            {isReferralsExpanded && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard
                    title="Total Referrals"
                    value={user.totalReferrals}
                    icon={Users}
                  />
                  <MetricCard
                    title="Referral Credits Earned"
                    value={user.totalReferralCredits}
                    icon={Coins}
                  />
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Join Date</th>
                        <th className="px-4 py-2 text-left">Credits Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.referrals.map((referral) => (
                        <tr
                          key={referral.email}
                          className="border-t border-border/50"
                        >
                          <td className="px-4 py-2">{referral.name}</td>
                          <td className="px-4 py-2">
                            {format(referral.joinDate, "MMM d, yyyy")}
                          </td>
                          <td className="px-4 py-2">
                            {referral.creditsEarned}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Credit History</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setIsCreditHistoryExpanded(!isCreditHistoryExpanded)
                }
              >
                {isCreditHistoryExpanded ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>

            {isCreditHistoryExpanded && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.creditHistory.map((item, index) => (
                      <tr key={index} className="border-t border-border/50">
                        <td className="px-4 py-2 text-sm">
                          {format(item.date, "MMM d, yyyy h:mm a")}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.description}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              item.type === "credit"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.amount} credits
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              item.status === "completed"
                                ? "bg-blue-50 text-blue-700"
                                : item.status === "pending"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-red-50 text-red-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const CountryDistribution = ({
    countries,
    isExpanded,
    onToggle,
  }: {
    countries: CountryMetric[];
    isExpanded: boolean;
    onToggle: () => void;
  }) => (
    <div className="bg-card rounded-xl shadow-sm border border-border/50">
      <div
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Globe2 className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">User Distribution by Country</h3>
        </div>
        <Button variant="ghost" size="sm">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-border/50 space-y-4">
          {countries.map((country) => (
            <div key={country.country} className="flex items-center gap-4">
              <span className="w-32 text-sm font-medium">
                {country.country}
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${country.percentage}%` }}
                />
              </div>
              <span className="w-20 text-sm text-muted-foreground text-right">
                {country.userCount.toLocaleString()} (
                {country.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your application metrics
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers}
            icon={Users}
            trend={metrics.userGrowth}
          />
          <MetricCard
            title="Unique Visitors"
            value={metrics.totalUniqueVisitors}
            icon={Users}
          />
          <MetricCard
            title="Monthly Revenue"
            value={`$${metrics.monthlyRecurringRevenue.toLocaleString()}`}
            icon={CreditCard}
            trend={12.5}
          />
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers}
            icon={Users}
          />
          <MetricCard
            title="Total PDFs Analyzed"
            value={metrics.totalPdfAnalyzed}
            icon={FileText}
          />
          <MetricCard
            title="YouTube Queries"
            value={metrics.totalYoutubeQueries}
            icon={Youtube}
          />
          <MetricCard
            title="User Growth"
            value={`${metrics.userGrowth}%`}
            icon={TrendingUp}
          />
          <MetricCard
            title="Avg. Credits/User"
            value={metrics.averageCreditsPerUser}
            icon={CreditCard}
          />
        </div>

        <div className="mb-8">
          <CountryDistribution
            countries={metrics.countryDistribution}
            isExpanded={isCountryExpanded}
            onToggle={() => setIsCountryExpanded(!isCountryExpanded)}
          />
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    const csv = users.map((user) => ({
                      name: user.name,
                      email: user.email,
                      status: user.status,
                      credits: user.credits,
                      pdfs: user.totalPdfAnalyzed,
                      youtube: user.totalYoutubeQueries,
                      joinDate: format(user.joinDate, "yyyy-MM-dd"),
                    }));
                    const csvString = [
                      Object.keys(csv[0]).join(","),
                      ...csv.map((row) => Object.values(row).join(",")),
                    ].join("\n");
                    const blob = new Blob([csvString], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `users-${format(new Date(), "yyyy-MM-dd")}.csv`;
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Credits
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    PDFs
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    YouTube
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Join Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium">{user.name}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "active"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={user.credits}
                          readOnly
                          className="w-20"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsCreditModalOpen(true);
                          }}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {user.totalPdfAnalyzed}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {user.totalYoutubeQueries}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(user.joinDate, "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsUserDetailsModalOpen(true);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleBanUser(user.id)}
                        >
                          Ban
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pageCount}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {selectedUser && (
        <>
          <CreditAdjustmentModal
            isOpen={isCreditModalOpen}
            onClose={() => setIsCreditModalOpen(false)}
            onConfirm={(amount, type) => {
              handleUpdateCredits(selectedUser.id, amount, type);
              setIsCreditModalOpen(false);
            }}
            userId={selectedUser.id}
            currentCredits={selectedUser.credits}
          />
          <UserDetailsModal
            user={selectedUser}
            isOpen={isUserDetailsModalOpen}
            onClose={() => setIsUserDetailsModalOpen(false)}
          />
        </>
      )}

      {/* Add this button in the top section near other metric cards */}
      <Button
        variant="outline"
        onClick={() => setShowFeedbacks(!showFeedbacks)}
        className="mb-4"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Manage Feedback
      </Button>

      {/* Feedback Management Section */}
      {showFeedbacks && (
        <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden mt-8">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-xl font-semibold mb-4">Feedback Management</h2>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <MetricCard
                title="Total Feedback"
                value={feedbackMetrics.total}
                icon={MessageSquare}
              />
              <MetricCard
                title="Pending Review"
                value={feedbackMetrics.pending}
                icon={AlertTriangle}
              />
              <MetricCard
                title="Verified"
                value={feedbackMetrics.verified}
                icon={Check}
              />
              <MetricCard
                title="Rejected"
                value={feedbackMetrics.rejected}
                icon={X}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Submitted By
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {feedbacks.map((feedback) => (
                    <tr
                      key={feedback.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            feedback.type === "bug"
                              ? "bg-red-50 text-red-700"
                              : feedback.type === "feature"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          {feedback.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{feedback.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            feedback.priority === "high"
                              ? "bg-red-50 text-red-700"
                              : feedback.priority === "medium"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {feedback.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {feedback.submittedBy.name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            feedback.status === "pending"
                              ? "bg-yellow-50 text-yellow-700"
                              : feedback.status === "verified"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {feedback.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {feedback.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleVerifyFeedback(feedback.id)
                                }
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Verify
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleRejectFeedback(feedback.id)
                                }
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
