interface FeedbackForm {
  type: "bug" | "feature" | "improvement";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  steps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface GoogleAuthPayload {
  token: string;
  name: string | null;
  email: string | null;
  referral?: string;
}

interface MoreQuestionsProps {
  chatId: string;
  defaultOpen: boolean;
  showChildButton?: boolean;
  lowQuestions?: boolean;
}

interface MoreQuestionsResponse {
  status: string;
  message: string;
  data: {
    limit: number;
    usage: number;
    new_credit_balance: number;
  };
}

interface UpdateDetailsResponse {
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
