"use client";

import { useElements, useStripe, PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";

type PaymentCardProps = {
  onSuccess: (paymentId: string) => Promise<void> | void;
};

const PaymentCard = ({ onSuccess }: PaymentCardProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment failed. Please try again.");
      setIsProcessing(false);
      return;
    }

    if (
      paymentIntent?.status === "succeeded" ||
      paymentIntent?.status === "processing"
    ) {
      if (!paymentIntent?.id) {
        setErrorMessage("Payment succeeded without an ID. Please contact us.");
        setIsProcessing(false);
        return;
      }
      await onSuccess(paymentIntent.id);
      setIsProcessing(false);
      return;
    }

    setErrorMessage("Payment could not be completed. Please try again.");
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
      >
        {isProcessing ? "Processing..." : "Pay"}
      </button>
    </form>
  );
};

export default PaymentCard;
