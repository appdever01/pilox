"use client";

import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { auth } from "@/lib/auth";
import { API_ROUTES } from "@/lib/config";
import AuthApiClient from "@/lib/auth-api-client";
import { MessageSquare, Info, Loader2 } from "lucide-react";

export function MoreQuestions({
  chatId,
  defaultOpen,
  showChildButton = true,
  lowQuestions = false,
  setLimit,
  setUsage,
}: MoreQuestionsProps & {
  setLimit: (limit: number) => void;
  setUsage: (usage: number) => void;
}) {
  const user = auth.getUser();
  const [credits, setCredits] = useState(1);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const questionsPerCredit = 10;
  const [isLoading, setIsLoading] = useState(false);

  const handleGetMoreQuestions = async () => {
    setIsLoading(true);
    if (credits <= 0) {
      toast.error("Please enter a valid number of credits");
      setIsLoading(false);
      return;
    }
    if (credits > (user?.credits || 0)) {
      toast.error("You don't have enough credits");
      setIsLoading(false);
      return;
    }
    try {
      const response = await AuthApiClient.post<MoreQuestionsResponse>(
        API_ROUTES.INCREASE_CHAT_LIMIT + `/${chatId}`,
        {
          credits: credits,
        }
      );
      if (response.status == "success") {
        toast.success(response.message);
        auth.setUser({
          ...user,
          credits: response.data.new_credit_balance,
        });
        setLimit(response.data.limit);
        setUsage(response.data.usage);
        setIsOpen(false);
      } else {
        toast.error(response.message);
      }
      setIsLoading(false);
    } catch (error) {
      toast.error("Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {showChildButton && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-7">
            Get More
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            {lowQuestions
              ? "Oops, you ran out of questions"
              : "Get more questions"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="bg-emerald-50/80 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 text-emerald-600">
              <Info className="w-5 h-5" />
              <p className="text-sm">Your balance: {user?.credits} credits</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 mt-2">
              <Info className="w-5 h-5" />
              <p className="text-sm">
                1 credit = +{questionsPerCredit} questions
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="number"
              min="1"
              max={user?.credits}
              disabled={isLoading}
              value={credits > 0 ? credits : ""}
              onChange={(e) => setCredits(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              placeholder="Enter number of credits"
            />
          </div>

          <Button
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12"
            disabled={
              credits <= 0 || isLoading || credits > (user?.credits || 0)
            }
            onClick={handleGetMoreQuestions}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              `Get +${credits * questionsPerCredit} questions`
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Questions never expire and can be used anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
