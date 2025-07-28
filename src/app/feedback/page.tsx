"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/lib/auth";
import { API_ROUTES } from "@/lib/config";
import AuthApiClient from "@/lib/auth-api-client";
import { Bug, MessageSquare, Star, Loader2, AlertTriangle } from "lucide-react";

export default function FeedbackPage() {
  const user = auth.getUser();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<FeedbackForm>({
    type: "bug",
    title: "",
    description: "",
    priority: "low",
    steps: "",
    expectedBehavior: "",
    actualBehavior: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit feedback");
      return;
    }

    const requiredFields = ['title', 'description', 'type', 'priority'];
    if (form.type === 'bug') {
      requiredFields.push('steps', 'expectedBehavior', 'actualBehavior');
    }

    const emptyFields = requiredFields.filter(field => !form[field as keyof FeedbackForm]);
    if (emptyFields.length > 0) {
      toast.error(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      return;
    }

    setIsLoading(true);
    try {
      const data = await AuthApiClient.post<{
        status: string;
        message: string;
      }>(API_ROUTES.SUBMIT_FEEDBACK, form);
      if (data.status === "success") {
        toast.success(
          "Thank you for your feedback! If verified, you'll receive 10 credits.",
          {
            icon: <Star className="w-4 h-4 text-yellow-500" />,
          }
        );
        setForm({
          type: "bug",
          title: "",
          description: "",
          priority: "low",
          steps: "",
          expectedBehavior: "",
          actualBehavior: "",
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold mb-2">Feedback & Bug Reports</h1>
            <p className="text-muted-foreground">
              Help us improve by reporting bugs or suggesting improvements.
              Verified bug reports earn 10 credits!
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={form.type}
                  onValueChange={(value: "bug" | "feature" | "improvement") =>
                    setForm({ ...form, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={form.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setForm({ ...form, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Detailed explanation of the issue"
                required
                rows={4}
              />
            </div>

            {form.type === "bug" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Steps to Reproduce *
                  </label>
                  <Textarea
                    value={form.steps}
                    onChange={(e) =>
                      setForm({ ...form, steps: e.target.value })
                    }
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Expected Behavior *
                    </label>
                    <Textarea
                      value={form.expectedBehavior}
                      onChange={(e) =>
                        setForm({ ...form, expectedBehavior: e.target.value })
                      }
                      placeholder="What should happen?"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Actual Behavior *
                    </label>
                    <Textarea
                      value={form.actualBehavior}
                      onChange={(e) =>
                        setForm({ ...form, actualBehavior: e.target.value })
                      }
                      placeholder="What actually happened?"
                      rows={2}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : form.type === "bug" ? (
                  <Bug className="w-4 h-4 mr-2" />
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                Submit Feedback
              </Button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-yellow-50/50 rounded-xl p-4 border border-yellow-100"
        >
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">
              Verified bug reports will be rewarded with 10 credits. Our team
              will review your submission and update your credit balance if the
              report is valid.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

