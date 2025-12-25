"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingModal } from "@/app/components/BookingModal";
import { useAuth } from "@/context/AuthContext";
import { getEventById, bookEvent, toggleFavoriteEvent, isEventFavorited } from "@/lib/firestore";
import { Button } from "@/app/components/ui/Button";
import { MapPin, Calendar, Clock, Users, ArrowLeft, Share2, Heart } from "lucide-react";
import { Event } from "@/data/mockData";

import { Suspense } from "react";

// Force client-side rendering for this page to handle search params
export const dynamic = "force-dynamic";

function EventContent() {
    const searchParams = useSearchParams();
    // ... rest of the component logic

    const id = searchParams.get("id");
    const router = useRouter();
    const { user, signInWithGoogle } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        async function fetchEvent() {
            if (!id) return;
            try {
                const data = await getEventById(id);
                setEvent(data);
                if (user) {
                    isEventFavorited(user.uid, id).then(setIsSaved);
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchEvent();
    }, [id, user]);

    const handleBookClick = async () => {
        if (!user) {
            try {
                await signInWithGoogle();
            } catch (error) {
                console.error("Login failed:", error);
            }
            return;
        }
        setIsBookingModalOpen(true);
    };

    const handleFavorite = async () => {
        if (!user || !event) {
            signInWithGoogle();
            return;
        }

        const newState = !isSaved;
        setIsSaved(newState);

        try {
            await toggleFavoriteEvent(user.uid, event.id);
        } catch (error) {
            console.error("Error toggling favorite:", error);
            setIsSaved(!newState);
        }
    };

    const handleConfirmBooking = async (quantity: number) => {
        if (!event || !user) return;

        setBookingLoading(true);
        try {
            await bookEvent(event.id, user.uid, {
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                photoURL: user.photoURL
            }, quantity);

            setIsBookingModalOpen(false);
            alert(`Success! booked ${quantity} ticket(s).`);
            router.refresh();

            // Re-fetch to update attendees count
            const updatedEvent = await getEventById(event.id);
            setEvent(updatedEvent);
        } catch (error: any) {
            alert(`Booking Failed: ${error}`);
        } finally {
            setBookingLoading(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event?.title || "Event",
                    text: `Check out ${event?.title} on CornerClub!`,
                    url: url,
                });
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Event not found</h1>
                <Button onClick={() => router.push("/")} variant="outline">
                    Back to Home
                </Button>
            </div>
        );
    }

    const startDateTime = new Date(event.date || event.createdAt); // Fallback
    const isPending = event.status === 'pending';
    const isSoldOut = event.attendees >= event.capacity;
    const isPastEvent = new Date(event.date) < new Date();

    return (
        <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-black">
            {/* Status Banner */}
            {isPending && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
                    <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-yellow-800 dark:text-yellow-200">
                        <Clock className="h-5 w-5" />
                        <span className="font-medium">This event is currently pending admin approval. It is not publicly visible yet.</span>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <img
                    src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}
                    alt={event.title}
                    className={`h-full w-full object-cover ${isPending ? 'grayscale' : ''}`}
                />

                <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent pt-20 pb-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <Button
                            variant="ghost"
                            className="mb-6 text-white hover:bg-white/20 hover:text-white"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl lg:text-6xl">{event.title}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-zinc-200">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                <span className="text-lg">{event.location}, {event.city}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span className="text-lg">{new Date(event.date).toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span className="text-lg">{event.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
                    <div>
                        {/* Title/Badge were here but moved to hero. Keeping this clean or removing. */}
                        {/* Actually let's just keep the share/favorite buttons here or move them up? */}
                        {/* The original design had a big white card overlapping the hero. */}
                        {/* I'll simplify: Hero has title/date. Below is content + Price Card. */}
                        {/* But I need to fix the syntax error mostly. */}

                        {/* Re-implementing the Price/Share block that was floating at line 180 */}
                        <div className="flex items-center gap-3">
                            <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                                {event.price === 0 ? "Free" : `₹${event.price}`}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleShare} className="rounded-full border border-zinc-200 p-2 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800">
                                    <Share2 className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                                </button>
                                <button onClick={handleFavorite} className="rounded-full border border-zinc-200 p-2 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800">
                                    <Heart className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : "text-zinc-600 dark:text-zinc-400"}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">About Event</h3>
                            <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                                {event.description}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Organizer</h3>
                            <div className="mt-3 flex items-center gap-3">
                                <img
                                    src={event.creator?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous"}
                                    alt={event.creator?.name}
                                    className="h-12 w-12 rounded-full border border-zinc-200 bg-zinc-100"
                                />
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-white">{event.creator?.name || "Anonymous Organizer"}</p>
                                    <p className="text-sm text-zinc-500">Event Host</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-800/50">
                            <h3 className="font-semibold text-zinc-900 dark:text-white">Booking Info</h3>

                            <div className="mt-4 flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-700">
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Capacity</span>
                                <span className="font-medium">{event.capacity}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-700">
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">Attendees</span>
                                <span className="font-medium flex items-center gap-1">
                                    <Users className="h-3 w-3" /> {event.attendees}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">Spots Left</span>
                                <span className={`font-bold ${isSoldOut ? "text-red-500" : "text-green-600"}`}>
                                    {Math.max(0, event.capacity - event.attendees)}
                                </span>
                            </div>

                            <div className="mt-6">
                                <Button
                                    className="w-full"
                                    onClick={handleBookClick}
                                    disabled={isSoldOut || isPastEvent || isPending}
                                >
                                    {isPending ? "Pending Approval" :
                                        isSoldOut ? "Sold Out" :
                                            isPastEvent ? "Event Ended" :
                                                user ? "Book Now" : "Sign in to Book"}
                                </Button>
                                {!user && (
                                    <p className="mt-2 text-center text-xs text-zinc-500">
                                        You need to login to reserve a spot.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>



            </div>

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                onConfirm={handleConfirmBooking}
                loading={bookingLoading}
                title={event.title}
                price={event.price}
                maxQuantity={Math.max(0, event.capacity - event.attendees)}
            />
        </div >
    );
}

export default function EventDetailsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#f98109]"></div>
            </div>
        }>
            <EventContent />
        </Suspense>
    );
}
