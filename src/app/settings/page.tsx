"use client";
//@ts-nocheck
import { toast } from "sonner";
import { useState } from "react";
import { auth } from "@/lib/auth";
import { User } from "@/types/auth";
import { API_ROUTES } from "@/lib/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthApiClient from "@/lib/auth-api-client";
import PrivateRoute from "@/components/PrivateRoute";
import { Eye, EyeOff, Loader2, Copy, Check, CheckCircle, MessageSquarePlus, Wallet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectItem,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
interface UpdateDetailsResponse {
  status: string;
  message: string;
  data: {
    user: {
      name: string;
      walletAddress: string;
      currency: {
        name: string;
        code: string;
        symbol: string;
        rate: number;
      };
    };
  };
}

interface UpdatePasswordResponse {
  status: string;
  message: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const user = auth.getUser();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [currency, setCurrency] = useState(user?.currency?.code || "NGN");
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralCode = user?.referralCode || "";
  const referralLink = `https://pilox.com.ng/signup/${referralCode}`;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameWords = name.trim().split(/\s+/);
    if (nameWords.length !== 2) {
      toast.error("Please enter both first and last name");
      return;
    }

    setIsProfileLoading(true);
    try {
      const data = await AuthApiClient.post<UpdateDetailsResponse>(
        API_ROUTES.UPDATE_DETAILS,
        {
          name,
          currency,
        }
      );
      if (data.status == "success") {
        toast.success("Profile updated successfully!");
        auth.updateUser({
          ...user,
          name: data.data.user.name,
          currency: data.data.user.currency,
        });
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }
    setIsPasswordLoading(true);
    try {
      const data = await AuthApiClient.post<UpdatePasswordResponse>(
        API_ROUTES.UPDATE_PASSWORD,
        {
          old_password: currentPassword,
          password: newPassword,
          confirm_password: confirmPassword,
        }
      );
      if (data.status === "success") {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsPasswordLoading(false);
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

  return (
    <PrivateRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Profile Settings */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Profile Settings</h2>
              <div className="text-sm text-muted-foreground">
                Manage your account details
              </div>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="NGN">NGN (₦)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isProfileLoading}>
                {isProfileLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          </div>

          {/* Wallet Settings */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Connected Wallet</h2>
              <div className="text-sm text-muted-foreground">
                Manage your blockchain wallet
              </div>
            </div>
            <div className="space-y-4">
              {user?.walletAddress ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Your Wallet Address
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-4 bg-gray-50 rounded-lg font-mono text-sm break-all">
                      {user.walletAddress}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(user.walletAddress || "");
                        toast.success("Wallet address copied!");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-primary/5 rounded-xl p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No Wallet Connected</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Connect your wallet to start claiming $PILOX tokens and participate in the EDUChain Network.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/claim')}
                    className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 hover:opacity-90"
                  >
                    Connect Wallet
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Security</h2>
              <div className="text-sm text-muted-foreground">
                Update your password
              </div>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isPasswordLoading}>
                {isPasswordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </div>

          {/* Referral Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Referral Program</h2>
              <div className="text-sm text-muted-foreground">
                Share and earn credits
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Referral Link
                </label>
                <div className="flex w-full items-center gap-2">
                  <Input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="w-full font-mono bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyReferralLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg p-4">
                <h3 className="font-medium mb-2">How it works</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Share your referral link with friends</li>
                  <li>2. They get 15 free credits when they sign up</li>
                  <li>3. You earn 2 credits for each referral</li>
                  <li>4. No limit on how many friends you can refer!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feedback Announcement */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl shadow-lg p-6">
            <div className="flex flex-col items-center text-white text-center space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Help Us Improve & Earn!</h2>
              </div>
              <p className="text-lg">
                Your feedback shapes our future! Share your thoughts or report bugs and get rewarded with <span className="font-bold">10 FREE CREDITS</span> for each validated submission.
              </p>
              <div className="bg-white/20 rounded-lg p-4 w-full">
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Submit feature suggestions or bug reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Get 10 credits for each validated feedback
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Help make the platform better for everyone
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => router.push('/feedback')}
                className="bg-white text-purple-600 hover:bg-white/90 font-semibold px-8 py-2"
              >
                Submit Feedback Now
              </Button>
            </div>
          </div>

        </div>
      </div>
    </PrivateRoute>
  );
}
