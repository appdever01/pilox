declare module "@/types/types" {
  export interface FeedbackForm {
    type: "bug" | "feature" | "improvement";
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    steps?: string;
    expectedBehavior?: string;
    actualBehavior?: string;
  }

  export interface LoginPayload {
    email: string;
    password: string;
  }

  export interface GoogleAuthPayload {
    token: string;
    name: string | null;
    email: string | null;
    referral?: string;
  }

  export interface MoreQuestionsProps {
    chatId: string;
    defaultOpen: boolean;
    showChildButton?: boolean;
    lowQuestions?: boolean;
  }

  export interface MoreQuestionsResponse {
    status: string;
    message: string;
    data: {
      limit: number;
      usage: number;
      new_credit_balance: number;
    };
  }

  export interface UpdateDetailsResponse {
    status: "success" | "error";
    message: string;
    data: {
      user: {
        name: string;
        currency: {
          name: string;
          code: string;
          symbol: string;
          rate: number;
        };
      };
    };
  }
}