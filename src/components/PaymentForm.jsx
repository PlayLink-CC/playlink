import React, { useEffect, useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { Lock } from "lucide-react";

export default function PaymentForm({ onSuccess, onBack, amount }) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) {
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                    break;
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again.");
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
        });
    }, [stripe]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${window.location.origin}/booking-success`, // We'll handle this differently for custom flow if needed, but return_url is required for some payment methods.
            },
            redirect: "if_required", // Important: Avoid redirect if possible
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
            } else {
                setMessage("An unexpected error occurred.");
            }
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            // Manual success handling since we used redirect: "if_required"
            onSuccess(paymentIntent);
        } else {
            setIsLoading(false);
        }
    };

    const paymentElementOptions = {
        // layout: "tabs", // Commenting out to see if default works
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="w-full">
            <div style={{ minHeight: "200px" }}>
                <PaymentElement id="payment-element" options={paymentElementOptions} onReady={() => console.log("PaymentElement Ready")} />
            </div>

            {/* Cancellation Policy and Summary could be here too, but let's keep it simple */}

            {message && <div id="payment-message" className="text-red-500 text-sm mt-4 p-3 bg-red-50 rounded">{message}</div>}

            <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="px-6 py-3 text-gray-700 bg-gray-100 font-semibold rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                >
                    Back
                </button>

                <button
                    disabled={isLoading || !stripe || !elements}
                    id="submit"
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    <Lock size={18} className="mr-2" />
                    <span id="button-text">
                        {isLoading ? "Processing..." : `Pay LKR ${amount}`}
                    </span>
                </button>
            </div>
        </form>
    );
}
