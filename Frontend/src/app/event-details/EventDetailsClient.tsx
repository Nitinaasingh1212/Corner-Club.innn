/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingModal } from "@/app/components/BookingModal";
import { useAuth } from "@/context/AuthContext";
import { getEventById, bookEvent, toggleFavoriteEvent, isEventFavorited, getEventAttendees, getUserProfile, getUserBookings } from "@/lib/firestore";
import { Button } from "@/app/components/ui/Button";
import { MapPin, Calendar, Clock, Users, ArrowLeft, Share2, Heart, CheckCircle, Phone, Youtube, Facebook, Instagram, Image as ImageIcon, Lock } from "lucide-react";
import { Event } from "@/data/mockData";
import EventChat from "@/app/components/EventChat";

export default function EventDetailsClient({ id }: { id: string | null }) {
    const router = useRouter();
    const { user, signInWithGoogle } = useAuth();
    const [event, setEvent] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [hasBooked, setHasBooked] = useState(false);

    // New States
    const [attendees, setAttendees] = useState<any[]>([]);
    const [loadingAttendees, setLoadingAttendees] = useState(false);
    const [showAttendees, setShowAttendees] = useState(false);
    const [creatorProfile, setCreatorProfile] = useState<any>(null);

    useEffect(() => {
        async function fetchEventAndData() {
            if (!id) return;
            try {
                const data = await getEventById(id);
                setEvent(data);

                if (data && data.creatorId) {
                    // Fetch Creator Profile for Portfolio/Verification
                    getUserProfile(data.creatorId).then(setCreatorProfile).catch(err => console.log("No creator profile found", err));
                }

                if (user) {
                    isEventFavorited(user.uid, id).then(setIsSaved);

                    // Check if user has booked this event
                    getUserBookings(user.uid).then((bookings) => {
                        const booked = bookings.some((b: any) => b.eventId === id);
                        setHasBooked(booked);
                    }).catch(console.error);
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchEventAndData();
    }, [id, user]);

    // Fetch attendees for creator
    useEffect(() => {
        if (user && event && user.uid === event.creatorId) {
            setLoadingAttendees(true);
            getEventAttendees(event.id)
                .then(setAttendees)
                .catch(console.error)
                .finally(() => setLoadingAttendees(false));
        }
    }, [user, event]);

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
            if (!user.email) {
                alert("Error: Your account has no email attached. Cannot send ticket.");
                return;
            }
            alert(`Booking for: ${user.email}\nSending request...`);

            await bookEvent(event.id, user.uid, {
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                photoURL: user.photoURL
            }, quantity);

            setIsBookingModalOpen(false);
            alert(`Success! booked ${quantity} ticket(s).`);
            setHasBooked(true); // Unlock chat immediately
            router.refresh();

            // Re-fetch to update attendees count
            const updatedEvent = await getEventById(event.id);
            setEvent(updatedEvent);

            // Re-fetch attendees list if creator
            if (user.uid === event.creatorId) {
                getEventAttendees(event.id).then(setAttendees);
            }
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

    const startDateTime = new Date(event.date); // Fallback
    const isPending = event.status === 'pending';
    const isSoldOut = event.attendees >= event.capacity;
    const isPastEvent = new Date(event.date) < new Date();
    const isCreator = user?.uid === event.creatorId;
    const canChat = hasBooked || isCreator;

    // Merge creator info from event snapshot and fresh profile if needed
    const creatorInfo = {
        name: event.creator?.name || creatorProfile?.displayName || "Organizer",
        avatar: event.creator?.avatar || creatorProfile?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous",
        isVerified: true, // Always show verified badge as requested
        phone: event.creator?.phone || creatorProfile?.phone,
        social: event.creator?.social || creatorProfile?.social || {},
        portfolio: creatorProfile?.portfolio || [] // Array of image URLs
    };

    const mapAddress = event.address || event.location;

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
                        {/* Organizer Section */}
                        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Organizer</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <img
                                    src={creatorInfo.avatar}
                                    alt={creatorInfo.name}
                                    className="h-16 w-16 rounded-full border border-zinc-200 bg-zinc-100 object-cover"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-lg text-zinc-900 dark:text-white">{creatorInfo.name}</p>
                                        {creatorInfo.isVerified && (
                                            <CheckCircle className="h-5 w-5 text-blue-500 fill-blue-100" />
                                        )}
                                    </div>
                                    <p className="text-sm text-zinc-500">Host of this event</p>

                                    {/* Socials & Contact */}
                                    <div className="flex flex-wrap gap-4 mt-3">
                                        {creatorInfo.social?.instagram && (
                                            <a href={`https://instagram.com/${creatorInfo.social.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:opacity-80">
                                                <Instagram className="h-5 w-5" />
                                            </a>
                                        )}
                                        {creatorInfo.social?.facebook && (
                                            <a href={creatorInfo.social.facebook.startsWith('http') ? creatorInfo.social.facebook : `https://${creatorInfo.social.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:opacity-80">
                                                <Facebook className="h-5 w-5" />
                                            </a>
                                        )}
                                        {creatorInfo.social?.youtube && (
                                            <a href={creatorInfo.social.youtube.startsWith('http') ? creatorInfo.social.youtube : `https://${creatorInfo.social.youtube}`} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:opacity-80">
                                                <Youtube className="h-5 w-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">About Event</h3>
                            <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                                {event.description}
                            </p>
                        </div>

                        {/* Map Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Location</h3>
                            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 h-[300px] w-full bg-zinc-100">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                ></iframe>
                            </div>
                            <p className="mt-2 text-sm text-zinc-500 flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" /> {mapAddress}
                            </p>
                        </div>

                        {/* Portfolio / Past Events Media */}
                        {creatorInfo.portfolio && creatorInfo.portfolio.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-purple-500" />
                                    Past Events Gallery
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {creatorInfo.portfolio.map((img: string, idx: number) => (
                                        <div key={idx} className="aspect-square relative group overflow-hidden rounded-lg bg-zinc-100">
                                            <img src={img} alt={`Past event ${idx}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chat Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                                Community Chat {canChat ? "" : <Lock className="h-4 w-4 text-zinc-400" />}
                            </h3>
                            {canChat ? (
                                <EventChat eventId={event.id} user={user} />
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                                    <div className="rounded-full bg-zinc-200 p-4 dark:bg-zinc-800">
                                        <Lock className="h-8 w-8 text-zinc-400" />
                                    </div>
                                    <h4 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                                        Chat Locked
                                    </h4>
                                    <p className="mt-2 max-w-sm text-sm text-zinc-500">
                                        You must book a ticket for this event to join the community chat.
                                    </p>
                                    <Button className="mt-6" onClick={handleBookClick}>
                                        Book a Ticket
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
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
