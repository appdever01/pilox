"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { auth } from "@/lib/auth";
import { API_ROUTES } from "@/lib/config";
import { useRouter } from "next/navigation";
import PaystackPop from "@paystack/inline-js";
import AuthApiClient from "@/lib/auth-api-client";
import { Loader2, Zap, Info, Star } from "lucide-react";

interface UpdateDetailsResponse {
  status: "success" | "error";
  message: string;
  user: {
    name: string;
    currency: {
      name: string;
      code: string;
      symbol: string;
      rate: number;
    };
  };
}

export function BuyCredit() {
  const user = auth.getUser();
  const [credits, setCredits] = useState(10);
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [currencySymbol, setCurrencySymbol] = useState(
    !user ? "$" : user.currency?.symbol || "$"
  );
  const [currencyCode, setCurrencyCode] = useState(
    !user ? "USD" : user.currency?.code || "USD"
  );
  const [creditCost, setCreditCost] = useState(
    !user ? 0.2 : user.currency?.code == "NGN" ? 100 : 0.2
  );

  const pay = async () => {
    if (!user) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }
    setIsLoading(true);
    const email = user.email;
    const paystack = new PaystackPop();
    const callback = (response: any) => {
      if (response.status == "success") {
        toast.success("Payment successful");
        setIsOpen(false);
      } else {
        toast.error("Payment failed");
      }
      setIsLoading(false);
    };
    const onClose = () => {
      setIsLoading(false);
      setIsOpen(false);
    };
    setIsOpen(false);
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
        auth.updateUser({ ...user, currency: data.user.currency });
      } else {
        toast.error(data.message || "Failed to update currency");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Zap className="w-4 h-4" />
          Buy Credits
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-600" />
            Purchase Credits
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="bg-blue-50/80 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-600">
              <Info className="w-5 h-5" />
              <p className="text-sm">
                Oops, insufficient credit... purchase to continue
              </p>
            </div>
          </div>

          <div className="bg-blue-50/80 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-600">
              <Info className="w-5 h-5" />
              <p className="text-sm">
                1 credit = {currencySymbol}
                {creditCost}
              </p>
            </div>
          </div>

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

          <div className="space-y-4">
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

            <input
              type="number"
              min="10"
              max="1000"
              value={credits > 0 ? credits : ""}
              onChange={(e) => setCredits(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Enter amount of credits"
            />
          </div>

          <Button
            onClick={pay}
            disabled={isLoading || credits <= 0}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Buy {credits} credit{credits > 1 ? "s" : ""}
          </Button>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Credits never expire and can be used anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
