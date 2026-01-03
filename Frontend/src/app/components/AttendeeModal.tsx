"use client";

import { useEffect, useState } from "react";
import { getEventAttendees } from "@/lib/firestore";
import { X, Phone, User, Ticket } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

interface Attendee {
    id: string;
    user: {
        name: string;
        phone: string;
        email: string;
    };
    quantity: number;
    totalPrice: number;
    bookedAt: string;
}

interface AttendeeModalProps {
    eventId: string;
    onClose: () => void;
}

export function AttendeeModal({ eventId, onClose }: AttendeeModalProps) {
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getEventAttendees(eventId)
            .then(setAttendees)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [eventId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Event Attendees</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                        ))}
                    </div>
                ) : attendees.length > 0 ? (
                    <div className="max-h-[60vh] overflow-y-auto space-y-3">
                        {attendees.map((attendee) => (
                            <div key={attendee.id} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-white">
                                        <User className="h-4 w-4 text-zinc-400" />
                                        {attendee.user.name}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                        <Phone className="h-3 w-3" />
                                        {attendee.user.phone}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1 font-bold text-[#f98109]">
                                        <Ticket className="h-4 w-4" />
                                        {attendee.quantity}
                                    </div>
                                    <div className="text-xs text-zinc-400">
                                        ₹{attendee.totalPrice}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-zinc-500">
                        No bookings yet.
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <span className="flex-1 text-sm text-zinc-400 flex items-center">
                        Total Attendees: {attendees.reduce((acc, curr) => acc + (curr.quantity || 0), 0)}
                    </span>
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
}
