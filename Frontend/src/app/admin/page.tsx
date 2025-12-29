/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [pendingEvents, setPendingEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            // In real app, check for admin role
            // router.push("/");
        }
        fetchPendingEvents();
    }, [user]);

    async function fetchPendingEvents() {
        try {
            const res = await fetch("/api/admin/events/pending");
            if (res.ok) {
                const data = await res.json();
                setPendingEvents(data);
            }
        } catch (error) {
            console.error("Error fetching pending events:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleApprove = async (id: string) => {
        if (!confirm("Approve this event?")) return;
        try {
            await fetch(`/api/admin/events/${id}/approve`, { method: "POST" });
            setPendingEvents(prev => prev.filter(e => e.id !== id));
            alert("Event approved!");
        } catch (error) {
            alert("Error approving event");
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Reject and delete this event?")) return;
        try {
            await fetch(`/api/admin/events/${id}/reject`, { method: "POST" });
            setPendingEvents(prev => prev.filter(e => e.id !== id));
            alert("Event rejected!");
        } catch (error) {
            alert("Error rejecting event");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 pt-20 pb-20 dark:bg-black">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Admin Dashboard</h1>

                <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">Pending Events ({pendingEvents.length})</h2>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-white"></div>
                    </div>
                ) : pendingEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-zinc-200 rounded-2xl dark:border-zinc-800">
                        <div className="text-zinc-400 mb-2 text-6xl">✨</div>
                        <p className="text-lg font-medium text-zinc-900 dark:text-white">All caught up!</p>
                        <p className="text-sm text-zinc-500">No events waiting for approval.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {pendingEvents.map((event) => (
                            <div key={event.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="absolute top-3 right-3 z-10 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                    Pending Review
                                </div>

                                <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100 relative">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30")}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                    <div className="absolute bottom-3 left-4 text-white">
                                        <p className="font-semibold text-lg">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-4">
                                        <h3 className="line-clamp-1 text-lg font-bold text-zinc-900 dark:text-white">{event.title}</h3>
                                        <p className="text-sm text-zinc-500">{event.location}, {event.city}</p>
                                    </div>

                                    <div className="mb-6 flex-1">
                                        <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{event.description}</p>
                                    </div>

                                    <div className="flex gap-3 mt-auto">
                                        <Button
                                            onClick={() => handleApprove(event.id)}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm hover:shadow-emerald-500/20 transition-all"
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleReject(event.id)}
                                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/10"
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
