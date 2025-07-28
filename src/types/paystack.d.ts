declare module '@paystack/inline-js' {
  export default class PaystackPop {
    open(options: {
      key: string;
      email: string;
      amount: number;
      ref: string;
      currency: string;
      onClose?: () => void;
      callback?: (response: any) => void;
    }): void;

    checkout(options: {
      key: string;
      email: string;
      amount: number;
      ref: string;
      currency: string;
      onSuccess?: (response: any) => void;
      onClose?: () => void;
      callback?: (response: any) => void;
    }): void;
  }
} 