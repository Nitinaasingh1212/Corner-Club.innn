"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserBookings, getFavoriteEvents } from "@/lib/firestore";
import { Button } from "@/app/components/ui/Button";
import { EventCard } from "@/app/components/EventCard";
import { Settings, LogOut, Heart } from "lucide-react";

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [fetchingBookings, setFetchingBookings] = useState(true);
    const [savedEvents, setSavedEvents] = useState<any[]>([]);
    const [fetchingFavorites, setFetchingFavorites] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchBookings() {
            if (user) {
                try {
                    const data = await getUserBookings(user.uid);
                    setBookings(data);
                } catch (error) {
                    console.error("Error fetching bookings:", error);
                } finally {
                    setFetchingBookings(false);
                }
            }
        }
        async function fetchFavorites() {
            if (user) {
                try {
                    const data = await getFavoriteEvents(user.uid);
                    setSavedEvents(data);
                } catch (error) {
                    console.error("Error fetching favorites:", error);
                } finally {
                    setFetchingFavorites(false);
                }
            }
        }

        if (user) {
            fetchBookings();
            fetchFavorites();
        }
    }, [user]);

    if (loading) return null; // or a spinner
    if (!user) return null; // redirecting

    return (
        <div className="min-h-screen bg-zinc-50 pt-20 pb-20 dark:bg-black">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Profile Header */}
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 sm:p-10">
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                            <img
                                src={user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous"}
                                alt={user.displayName || "User"}
                                className="h-24 w-24 rounded-full border-4 border-zinc-100 bg-zinc-100 dark:border-zinc-800"
                            />
                            <div className="text-center sm:text-left">
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {user.displayName || "Community Member"}
                                </h1>
                                <p className="text-zinc-500">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={logout}>
                                <LogOut className="mr-2 h-4 w-4" /> Sign Out
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bookings Section */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Your Bookings</h2>

                    {fetchingBookings ? (
                        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-80 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"></div>
                            ))}
                        </div>
                    ) : bookings.length > 0 ? (
                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {bookings.map((booking) => (
                                booking.event ? (
                                    <div key={booking.id} className="relative">
                                        <div className="absolute left-14 top-3 z-20 rounded-full bg-[#f98109] px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
                                            {booking.quantity || 1} Ticket{(booking.quantity || 1) > 1 ? "s" : ""}
                                        </div>
                                        <EventCard event={booking.event} />
                                    </div>
                                ) : null
                            ))}
                        </div>
                    ) : (
                        <div className="mt-20 flex flex-col items-center justify-center text-center">
                            <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-900">
                                <CalendarIcon className="h-12 w-12 text-zinc-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">No upcoming events</h3>
                            <p className="mt-2 text-zinc-500">You haven't booked any events yet.</p>
                            <Button className="mt-6" onClick={() => router.push("/")}>
                                Explore Events
                            </Button>
                        </div>
                    )}
                </div>

                {/* Saved Events Section */}
                <div className="mt-12 mb-20">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Saved Events</h2>

                    {fetchingFavorites ? (
                        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-80 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"></div>
                            ))}
                        </div>
                    ) : savedEvents.length > 0 ? (
                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {savedEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-12 flex flex-col items-center justify-center text-center">
                            <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-900">
                                <Heart className="h-12 w-12 text-zinc-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">No saved events</h3>
                            <p className="mt-2 text-zinc-500">Events you heart will appear here.</p>
                            <Button className="mt-6" variant="outline" onClick={() => router.push("/")}>
                                Browse Events
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CalendarIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}
