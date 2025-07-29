import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Loader2 } from "lucide-react";
import PaystackPop from "@paystack/inline-js";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

interface PaymentGatewayProps {
  open: boolean;
  amount: number;
  currency: string;
  symbol: string;
  email: string;
  onSuccess?: () => void;
  onClose?: () => void;
  setIsOpen: (open: boolean) => void;
  loading: (loading: boolean) => void;
}

export default function PaymentGateway({ open, amount, currency, symbol, email, onSuccess, onClose, setIsOpen, loading }: PaymentGatewayProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePaystackPayment = async () => {
    setIsLoading(true);
    const callback = (response: any) => {
        if (response.status == "success") {
            onSuccess?.();
        } else {
            onClose?.();
        }
      setIsLoading(false);
    };
    const onPaymentClose = () => {
      setIsLoading(false);
      setIsOpen(false);
      onClose?.();
    };
    setIsOpen(false);
    setIsLoading(true);
    loading(true);
    const paystack = new PaystackPop();
    await paystack.checkout({
      key: "pk_test_c720d983a1e01efbbe84667533e75c04271c0a22",
      email: email,
      amount: amount * 100,
      currency: currency,
      ref: "" + Math.floor(Math.random() * 1000000000 + 1),
      callback,
      onClose: onPaymentClose
    });
  };

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Payment Method
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="paypal" className="mt-6">
          <TabsList className="grid grid-cols-2 gap-4 bg-transparent h-24">
            <TabsTrigger
              value="paypal"
              className="data-[state=active]:bg-blue-50 border-2 data-[state=active]:border-blue-500 rounded-xl h-full"
            >
              <img src="/paypal.png" alt="PayPal" className="h-8" />
            </TabsTrigger>
            <TabsTrigger
              value="paystack"
              className="data-[state=active]:bg-blue-50 border-2 data-[state=active]:border-blue-500 rounded-xl h-full"
            >
              <img src="/paystack.png" alt="Paystack" className="h-8" />
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="paystack">
              <div className="rounded-xl border p-6 bg-blue-50/30">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold">
                      {symbol}{amount.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    onClick={handlePaystackPayment}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Pay with Paystack
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="paypal">
              <div className="rounded-xl border p-6 bg-blue-50/30">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold">
                      {symbol}{amount.toLocaleString()}
                    </span>
                  </div>
                    <PayPalScriptProvider options={{
                      clientId: "ARXl_X7T-1H56SgJfp7IsgQlKAHZvelmTFxN_BOok5fgJkjdulTChREcXKwlLtstUoQMYQw-RKgb-DwT",
                      currency: currency
                    }}>
                      <PayPalButtons
                        style={{
                          layout: "vertical",
                          height: 48
                        }}
                        onInit={() => {
                          console.log("PayPal initialized");
                        }}
                        createOrder={(data: any, actions: any) => {
                          return actions.order.create({
                            purchase_units: [
                              {
                                amount: {
                                  value: amount.toString(),
                                  currency_code: currency
                                }
                              }
                            ]
                          });
                        }}
                        onApprove={async (data: any, actions: any) => {
                          if (actions.order) {
                            const order = await actions.order.capture();
                            if (order.status === "COMPLETED") {
                              onSuccess?.();
                            }
                          }
                        }}
                        onError={() => {
                          onClose?.();
                        }}
                        onCancel={() => {
                          onClose?.();
                        }}
                      />
                    </PayPalScriptProvider>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
