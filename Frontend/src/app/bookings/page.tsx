/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserBookings } from "@/lib/firestore";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Ticket } from "lucide-react";

export default function BookingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);

    useEffect(() => {
        if (!user && !authLoading) {
            setLoading(false);
            return;
        }

        async function fetchBookings() {
            if (user) {
                try {
                    const data = await getUserBookings(user.uid);
                    setBookings(data);
                    if (data.length < 50) setHasMore(false);
                } catch (error) {
                    console.error("Failed to fetch bookings:", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchBookings();
    }, [user, authLoading]);

    const loadMore = async () => {
        if (!user || !hasMore || fetchingMore) return;
        setFetchingMore(true);
        try {
            const lastBooking = bookings[bookings.length - 1];
            const data = await getUserBookings(user.uid, lastBooking.bookedAt, lastBooking.id);
            setBookings(prev => [...prev, ...data]);
            if (data.length < 50) setHasMore(false);
        } catch (error) {
            console.error("Failed to load more bookings:", error);
        } finally {
            setFetchingMore(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-white"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <p className="text-zinc-500">Please login to view your tickets.</p>
                <Link href="/" className="text-[#f98109] hover:underline">Go Home</Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">My Tickets</h1>
            <p className="mt-2 text-zinc-500">Manage your upcoming events</p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <div key={booking.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                            {booking.event ? (
                                <>
                                    <div className="relative h-48 w-full">
                                        <Image
                                            src={booking.event.image}
                                            alt={booking.event.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-zinc-900 backdrop-blur-sm">
                                            {booking.status.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{booking.event.title}</h3>

                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(booking.event.date).toDateString()} at {booking.event.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                                <MapPin className="h-4 w-4" />
                                                <span>{booking.event.location}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                <Ticket className="h-3 w-3" />
                                                <span>Booked on {new Date(booking.bookedAt).toLocaleDateString()}</span>
                                            </div>
                                            <Link href={`/event-details?id=${booking.event.id}`}>
                                                <button className="text-sm font-medium text-[#f98109] hover:underline">
                                                    View Event
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-6">
                                    <p className="text-red-500">Event data unavailable (Event might have been deleted)</p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-12 dark:border-zinc-800">
                        <Ticket className="h-12 w-12 text-zinc-300" />
                        <p className="mt-4 text-zinc-500">You haven&apos;t booked any tickets yet.</p>
                        <Link href="/">
                            <button className="mt-4 rounded-full bg-[#f98109] px-6 py-2 text-sm font-medium text-white hover:bg-[#e07308]">
                                Browse Events
                            </button>
                        </Link>
                    </div>
                )}
            </div>

            {hasMore && bookings.length > 0 && (
                <div className="mt-12 flex justify-center pb-8">
                    <button
                        onClick={loadMore}
                        disabled={fetchingMore}
                        className="rounded-full border border-zinc-200 bg-white px-8 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 disabled:opacity-50"
                    >
                        {fetchingMore ? "Loading..." : "Load More Tickets"}
                    </button>
                </div>
            )}
        </div>

    );
}
