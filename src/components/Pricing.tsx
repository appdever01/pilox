"use client";

import {
  Check,
  Sparkles,
  Zap,
  Star,
  Info,
  Wallet,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "react-toastify";
import { auth } from "@/lib/auth";
import { useState } from "react";
import { motion } from "framer-motion";
import { API_ROUTES } from "@/lib/config";
import { useRouter } from "next/navigation";
import PaystackPop from "@paystack/inline-js";
import AuthApiClient from "@/lib/auth-api-client";

const features = {
  free: [
    "Smart PDF Viewer",
    "Basic PDF to Images",
    "Images to PDF",
    "Document Format Conversion",
    "15 Free Credits for New Users",
    "Basic Support",
    "LaTeX Renderer",
    "Optional IPFS Pinning (demo)",
  ],
  premium: [
    "All Free Features",
    "AI PDF Generation (2 credits)",
    "PDF Analysis (2 credits)",
    "PDF Quiz Generation (2 credits)",
    "PDF Video Explanations (3 credits)",
    "YouTube Video Analysis (3 credits)",
    "Priority Support",
    "On‑chain Integrity Hashes (demo)",
    "Verifiable Credentials for Modules",
  ],
};

export function Pricing() {
  const user = auth.getUser();
  const [credits, setCredits] = useState(10);
  const [isOpen, setIsOpen] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState(
    !user ? "$" : user.currency?.symbol || "$"
  );
  const [currencyCode, setCurrencyCode] = useState(
    !user ? "USD" : user.currency?.code || "USD"
  );
  const [creditCost, setCreditCost] = useState(
    !user ? 0.2 : user.currency?.code == "NGN" ? 100 : 0.2
  );
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const pay = async () => {
    if (!user) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }
    if (!user.isVerified) {
      toast.error("Please verify your email first");
      router.push("/verify-email");
      return;
    }
    if (credits <= 0) {
      toast.error("Please select a valid number of credits");
      return;
    }
    setIsLoading(true);
    const email = user.email;
    const paystack = new PaystackPop();
    const callback = (response: any) => {
      if (response.status == "success") {
        toast.success("Payment successful 🎉");
        toast.loading("Please wait while we update your credits...");
        setTimeout(() => {  
          window.location.reload();
        }, 3000);
      } else {
        toast.error(response.message || "Payment failed");
      }
      setIsLoading(false);
    };
    const onClose = () => {
      setIsLoading(false);
    };
    const amount = credits * creditCost * 100;
    await paystack.checkout({
      key: "pk_live_4da031073850b87031bc9783119a7d35362cbb69",
      email: email,
      amount: amount,
      ref: "" + Math.floor(Math.random() * 1000000000 + 1),
      currency: currencyCode,
      callback,
      onClose,
    });
  };

  const setCurrency = async (code: string) => {
    setCurrencyCode(code);
    if (code == "USD") {
      setCurrencySymbol("$");
      setCreditCost(0.2);
    } else if (code == "NGN") {
      setCurrencySymbol("₦");
      setCreditCost(100);
    }
    if (user) {
      const data = await AuthApiClient.post<UpdateDetailsResponse>(
        API_ROUTES.UPDATE_DETAILS,
        {
          currency: code,
          name: user?.name,
        }
      );
      if (data.status == "success") {
        auth.updateUser({ ...user, currency: data.data.user.currency });
      } else {
        toast.error(data.message || "Failed to update currency");
      }
    }
  };

  return (
    <section className="relative py-24 bg-white lg:px-20 xl:px-32" id="pricing">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 text-sm font-medium mb-8">
            <Wallet className="w-4 h-4" />
            <span>Simple Pricing</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pay As You Grow
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free. Add optional blockchain verifiability as your use case evolves
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Select value={currencyCode} onValueChange={setCurrency}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="NGN">NGN (₦)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-blue-50/30 rounded-3xl p-8 border border-blue-100 flex flex-col"
          >
            <div className="flex-grow">
              <h3 className="text-2xl font-semibold mb-2">Free Features</h3>
              <p className="text-muted-foreground mb-6">
                Essential tools for everyone; ideal for hackathon demos
              </p>

              <div className="bg-blue-50/80 rounded-2xl p-4 mb-8">
                <div className="flex items-center gap-2 text-blue-600">
                  <Sparkles className="size-4" />
                  <p className="text-xs font-medium">
                    Get 15 free credits when you sign up
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {features.free.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Starting from
                    </p>
                    <p className="text-2xl font-bold">{currencySymbol}0</p>
                  </div>
                  <div className="bg-blue-100/50 whitespace-nowrap px-4 py-1.5 rounded-full">
                    <span className="text-sm text-blue-600">
                      No Credit Card Required
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!auth.isAuthenticated() ? (
              <Button
                className="mt-6 w-full bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 
                           hover:border-blue-300 rounded-full h-12"
                onClick={() => router.push("/signup")}
              >
                Get 15 Free Credits
              </Button>
            ) : (
              <Button
                className="mt-6 w-full bg-gray-100 text-gray-500 border border-gray-200 
                           rounded-full h-12"
                disabled
              >
                Active
              </Button>
            )}
          </motion.div>

          {/* Premium Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative bg-blue-50/30 rounded-3xl p-8 border border-blue-100 flex flex-col"
          >
            <div className="absolute -top-3 left-6 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-full font-medium">
              Premium Features
            </div>

            <div className="flex-grow">
              <h3 className="text-2xl font-semibold mb-2">Credit‑Based Features</h3>
              <p className="text-muted-foreground mb-6">
                Pay per use with credits; unlock verifiable credentials and on‑chain proofs
              </p>

              <div className="bg-blue-50/80 rounded-2xl p-4 mb-8">
                <div className="flex items-center gap-2 text-blue-600">
                  <Star className="w-5 h-5" />
                  <p className="text-xs font-medium">
                    Access advanced AI features with credits
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {features.premium.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <Star className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Buy Credits</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          1 credit = {currencySymbol}
                          {creditCost}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      value={credits}
                      onChange={(e) => setCredits(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer
                               [&::-webkit-slider-thumb]:appearance-none
                               [&::-webkit-slider-thumb]:w-4
                               [&::-webkit-slider-thumb]:h-4
                               [&::-webkit-slider-thumb]:bg-blue-600
                               [&::-webkit-slider-thumb]:rounded-full
                               [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <span className="text-lg font-semibold min-w-[100px] text-right">
                      {currencySymbol}
                      {(credits * creditCost).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={credits > 0 ? credits : ""}
                      onChange={(e) => setCredits(Number(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-muted-foreground">
                      credits
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={pay}
              disabled={isLoading || credits <= 0}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                "Buy"
              )}{" "}
              {credits} credit{credits > 1 ? "s" : ""}
            </Button>
          </motion.div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200">
            <Info className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Credits never expire and can be used anytime
            </p>
          </div>
        </div>

        {/* {isOpen && (
          <PaymentGateway
            open={isOpen}
            amount={credits * creditCost}
            symbol={currencySymbol}
            currency={currencyCode}
            email={user?.email || ""}
            onSuccess={() => {
              toast.success("Payment successful 🎉");
              setIsOpen(false);
              setIsLoading(false);
            }}  
            onClose={() => {
              setIsLoading(false);
              setIsOpen(false);
            }}
            setIsOpen={setIsOpen}
            loading={setIsLoading}
          />
        )} */}
      </div>
    </section>
  );
}
