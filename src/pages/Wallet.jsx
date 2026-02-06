import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import TopUpModal from "../components/TopUpModal.jsx";
import { Plus } from "lucide-react";

const Wallet = () => {
    const { isAuthenticated, fetchWalletBalance } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);

    const fetchWalletData = () => {
        setLoading(true);
        fetch(`${import.meta.env.VITE_API_URL}/api/wallet/summary`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                setBalance(Number(data.balance));
                setTransactions(data.transactions || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load wallet", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchWalletData();
    }, [isAuthenticated]);

    const handleTopUpSuccess = () => {
        fetchWalletData();
        if (fetchWalletBalance) fetchWalletBalance(); // Update balance in navbar context
    };

    if (loading && transactions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading wallet...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 font-outfit">
            <div className="max-w-xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
                    <button
                        onClick={() => setIsTopUpOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-green-100 transform hover:-translate-y-0.5 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Top Up
                    </button>
                </div>

                {/* Uber Cash Style Card */}
                <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    {/* Decorative Gradient Blob */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500 rounded-full blur-3xl opacity-20"></div>

                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">Playlink Points</p>
                    <div className="mt-2 text-4xl font-bold">
                        {balance.toFixed(2)} <span className="text-lg text-gray-400 font-normal">pts</span>
                    </div>
                    <p className="mt-4 text-xs text-gray-500">
                        Use points to pay for court bookings and split shares.
                    </p>
                </div>

                {/* Transaction History */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {transactions.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <p>No transactions yet.</p>
                                <Link to="/venues" className="text-green-600 font-medium text-sm mt-2 inline-block">Book a court to get started</Link>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {transactions.map((tx) => {
                                    const isCredit = tx.direction === 'CREDIT'; // "CREDIT"
                                    // Color logic: Credit = Green, Debit = Gray or Red (Airbnb/Uber style usually makes payments black/gray)
                                    const amountClass = isCredit ? "text-green-600" : "text-gray-900";
                                    const sign = isCredit ? "+" : "";

                                    // Icon logic
                                    const icon = isCredit ? (
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                    );

                                    return (
                                        <li key={tx.transaction_id} className="p-4 hover:bg-gray-50 transition flex items-center gap-4">
                                            {icon}
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900">{tx.description}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                    <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                                                    {tx.venue_name && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{tx.venue_name}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`text-sm font-bold ${amountClass}`}>
                                                {sign}{Number(tx.amount).toFixed(2)}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <TopUpModal
                isOpen={isTopUpOpen}
                onClose={() => setIsTopUpOpen(false)}
                onRefresh={handleTopUpSuccess}
            />
        </div>
    );
};

export default Wallet;
