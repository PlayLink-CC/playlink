import React from 'react';
import { Check } from 'lucide-react';

const BookingProgressBar = ({ currentStep }) => {
    const steps = [
        { id: 1, label: "Selection" },
        { id: 2, label: "Split Options" },
        { id: 3, label: "Payment" },
        { id: 4, label: "Confirmation" }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto mb-10 mt-6 px-4">
            <div className="relative flex justify-between items-center">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full" />

                {/* Active Line Progress */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step) => (
                    <div key={step.id} className="flex flex-col items-center group cursor-default">
                        <div
                            className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
                ${currentStep > step.id
                                    ? "bg-green-500 border-green-500 text-white"
                                    : currentStep === step.id
                                        ? "bg-white border-green-500 text-green-600 shadow-md scale-110"
                                        : "bg-white border-gray-300 text-gray-400"
                                }
              `}
                        >
                            {currentStep > step.id ? <Check size={20} strokeWidth={3} /> : step.id}
                        </div>

                        <span
                            className={`
                mt-3 text-xs font-medium transition-colors duration-300 absolute -bottom-8 w-24 text-center
                ${currentStep >= step.id ? "text-gray-800" : "text-gray-400"}
              `}
                        >
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
            <div className="h-4"></div> {/* Spacer for absolute positioned labels */}
        </div>
    );
};

export default BookingProgressBar;
