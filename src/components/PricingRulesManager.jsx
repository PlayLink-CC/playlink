
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";

const PricingRulesManager = ({ venueId }) => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [multiplier, setMultiplier] = useState(1.5);
    const [daysOfWeek, setDaysOfWeek] = useState([]);

    const DAYS = [
        { id: 0, label: "Sun" },
        { id: 1, label: "Mon" },
        { id: 2, label: "Tue" },
        { id: 3, label: "Wed" },
        { id: 4, label: "Thu" },
        { id: 5, label: "Fri" },
        { id: 6, label: "Sat" },
    ];

    const fetchRules = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/${venueId}/pricing-rules`);
            if (res.ok) {
                const data = await res.json();
                setRules(data);
            }
        } catch (error) {
            console.error("Failed to load rules", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, [venueId]);

    const handleAddRule = async (e) => {
        e.preventDefault();

        if (Number(multiplier) < 1) {
            toast.error("Multiplier must be 1.0 or greater");
            return;
        }

        setAdding(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/${venueId}/pricing-rules`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name,
                    startTime,
                    endTime,
                    multiplier: Number(multiplier),
                    daysOfWeek
                })
            });

            if (!res.ok) throw new Error("Failed to add rule");

            toast.success("Pricing rule added");
            setName("");
            setStartTime("");
            setEndTime("");
            setMultiplier(1.5);
            setDaysOfWeek([]);
            fetchRules();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteRule = async (ruleId) => {
        if (!confirm("Delete this rule?")) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/${venueId}/pricing-rules/${ruleId}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (res.ok) {
                toast.success("Rule deleted");
                fetchRules();
            }
        } catch (error) {
            toast.error("Failed to delete rule");
        }
    };

    const toggleDay = (dayId) => {
        if (daysOfWeek.includes(dayId)) {
            setDaysOfWeek(daysOfWeek.filter(d => d !== dayId));
        } else {
            setDaysOfWeek([...daysOfWeek, dayId]);
        }
    };

    const formatDays = (daysJson) => {
        if (!daysJson) return "Every day";
        let days = typeof daysJson === 'string' ? JSON.parse(daysJson) : daysJson;
        if (!days || days.length === 0) return "Every day";
        if (days.length === 7) return "Every day";
        return days.map(d => DAYS.find(x => x.id === d)?.label).join(", ");
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
                <Clock className="mr-2 text-green-600" size={24} />
                Dynamic Pricing Rules
            </h2>
            <p className="text-sm text-gray-500 mb-6">
                Set higher prices for peak hours or special days.
            </p>

            {/* List Rules */}
            <div className="space-y-4 mb-8">
                {loading ? (
                    <p>Loading...</p>
                ) : rules.length === 0 ? (
                    <p className="text-gray-400 italic text-sm">No active pricing rules.</p>
                ) : (
                    rules.map(rule => (
                        <div key={rule.rule_id} className="flex items-center justify-between border p-4 rounded-lg bg-gray-50">
                            <div>
                                <h3 className="font-semibold text-gray-800">{rule.name}</h3>
                                <div className="text-xs text-gray-500 mt-1 flex gap-4">
                                    <span className="flex items-center"><Clock size={12} className="mr-1" /> {rule.start_time.slice(0, 5)} - {rule.end_time.slice(0, 5)}</span>
                                    <span className="flex items-center"><Calendar size={12} className="mr-1" /> {formatDays(rule.days_of_week)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-bold">
                                    {rule.multiplier}x Price
                                </span>
                                <button onClick={() => handleDeleteRule(rule.rule_id)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Rule Form */}
            <form onSubmit={handleAddRule} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-sm mb-3">Add New Rule</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Rule Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Weekend Peak"
                            value={name} onChange={e => setName(e.target.value)}
                            className="w-full text-sm border rounded p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Price Multiplier (e.g. 1.5 for +50%)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="1.0"
                            value={multiplier} onChange={e => setMultiplier(e.target.value)}
                            className="w-full text-sm border rounded p-2"
                            required
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                            type="time"
                            value={startTime} onChange={e => setStartTime(e.target.value)}
                            className="w-full text-sm border rounded p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                        <input
                            type="time"
                            value={endTime} onChange={e => setEndTime(e.target.value)}
                            className="w-full text-sm border rounded p-2"
                            required
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Apply on Days</label>
                    <div className="flex flex-wrap gap-2">
                        {DAYS.map(day => (
                            <button
                                key={day.id}
                                type="button"
                                onClick={() => toggleDay(day.id)}
                                className={`px-3 py-1 text-xs rounded-full border ${daysOfWeek.includes(day.id)
                                    ? "bg-green-600 text-white border-green-600"
                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                                    }`}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Leave empty to apply every day.</p>
                </div>

                <button
                    type="submit"
                    disabled={adding}
                    className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                    {adding ? "Adding..." : "Save Rule"}
                </button>
            </form>
        </div>
    );
};

export default PricingRulesManager;
