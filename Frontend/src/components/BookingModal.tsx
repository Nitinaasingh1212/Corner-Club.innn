"use client";

import { useState } from "react";
import { X, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (quantity: number) => Promise<void>;
    loading: boolean;
    title: string;
    price: number;
    currency?: string;
    maxQuantity?: number;
}

export function BookingModal({
    isOpen,
    onClose,
    onConfirm,
    loading,
    title,
    price,
    currency = "INR",
    maxQuantity = 10
}: BookingModalProps) {
    const [quantity, setQuantity] = useState(1);

    if (!isOpen) return null;

    const handleIncrement = () => {
        if (quantity < maxQuantity) setQuantity((prev) => prev + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) setQuantity((prev) => prev - 1);
    };

    const totalPrice = price * quantity;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Review Order</h3>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <X className="h-5 w-5 text-zinc-500" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Event Summary */}
                    <div className="mb-6 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                        <h4 className="font-semibold text-zinc-900 dark:text-white">{title}</h4>
                        <p className="text-sm text-zinc-500 mt-1">Standard Ticket</p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between py-4">
                        <span className="text-zinc-600 dark:text-zinc-400">Number of Tickets</span>
                        <div className="flex items-center gap-4 rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-800">
                            <button
                                onClick={handleDecrement}
                                disabled={quantity <= 1}
                                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-100 disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-zinc-700"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-4 text-center font-semibold">{quantity}</span>
                            <button
                                onClick={handleIncrement}
                                disabled={quantity >= maxQuantity}
                                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-100 disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-zinc-700"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="my-4 h-px w-full bg-zinc-100 dark:bg-zinc-800" />

                    {/* Total */}
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-lg font-medium text-zinc-900 dark:text-white">Total Amount</span>
                        <span className="text-2xl font-bold text-[#f98109]">
                            {totalPrice === 0 ? "Free" : `${currency === "INR" ? "₹" : "$"}${totalPrice}`}
                        </span>
                    </div>

                    <Button
                        onClick={() => onConfirm(quantity)}
                        className="w-full text-lg py-6"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                            </>
                        ) : (
                            `Pay ₹${totalPrice}`
                        )}
                    </Button>
                    <p className="mt-3 text-center text-xs text-zinc-400">
                        By checking out you agree to our Terms of Service.
                    </p>
                </div>
            </div>
        </div>
    );
}
