import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { X, CreditCard, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ amount, onCancel, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage("");

        try {
            // 1. Confirm the payment with Stripe
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: "if_required",
            });

            if (error) {
                setErrorMessage(error.message);
                setIsProcessing(false);
                return;
            }

            if (paymentIntent.status === "succeeded") {
                // 2. Confirm the top-up with our backend
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/confirm-topup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        paymentIntentId: paymentIntent.id,
                        amount: amount,
                    }),
                    credentials: "include",
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || "Failed to finalize top-up on server");
                }

                onSuccess();
            }
        } catch (err) {
            console.error("Top-Up Confirmation Error:", err);
            setErrorMessage(err.message || "An unexpected error occurred.");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4 max-h-[400px] overflow-y-auto pb-2">
                <PaymentElement />
            </div>

            {errorMessage && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{errorMessage}</p>
                </div>
            )}

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1 py-3 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="flex-[2] py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        `Top Up LKR ${amount.toFixed(2)}`
                    )}
                </button>
            </div>
        </form>
    );
};

const TopUpModal = ({ isOpen, onClose, onRefresh }) => {
    const [amount, setAmount] = useState("");
    const [step, setStep] = useState(1); // 1: Amount selection, 2: Payment info
    const [clientSecret, setClientSecret] = useState("");
    const [isInitializing, setIsInitializing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const presets = [1000, 2000, 5000];

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setAmount("");
            setClientSecret("");
            setIsSuccess(false);
        }
    }, [isOpen]);

    const handleInitializePayment = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 100) return;

        setIsInitializing(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/topup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: numAmount }),
                credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to initialize payment");

            const data = await response.json();
            setClientSecret(data.clientSecret);
            setStep(2);
        } catch (err) {
            console.error("Initialize Payment Error:", err);
        } finally {
            setIsInitializing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {isSuccess ? (
                    <div className="p-8 text-center space-y-4">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
                        <p className="text-gray-500">
                            Your wallet has been topped up with <span className="font-bold text-gray-900">LKR {parseFloat(amount).toFixed(2)}</span>.
                        </p>
                        <button
                            onClick={() => {
                                onRefresh();
                                onClose();
                            }}
                            className="w-full mt-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-green-100 rounded-xl text-green-600">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Top Up Wallet</h2>
                        </div>

                        {step === 1 ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                        Select Amount
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {presets.map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setAmount(p.toString())}
                                                className={`py-3 rounded-2xl font-bold transition border-2 ${amount === p.toString()
                                                    ? "border-green-600 bg-green-50 text-green-700"
                                                    : "border-gray-100 bg-gray-50 text-gray-600 hover:border-green-200 hover:bg-green-50/30"
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                        Or Enter custom amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">LKR</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Min. 100"
                                            className="w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-lg focus:outline-none focus:border-green-500 transition"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleInitializePayment}
                                    disabled={!amount || parseFloat(amount) < 100 || isInitializing}
                                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-200 transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
                                >
                                    {isInitializing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Initializing...
                                        </>
                                    ) : (
                                        <>
                                            Continue to Payment
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                <CheckoutForm
                                    amount={parseFloat(amount)}
                                    onCancel={() => setStep(1)}
                                    onSuccess={() => setIsSuccess(true)}
                                />
                            </Elements>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopUpModal;
