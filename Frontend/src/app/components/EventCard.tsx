"use client";

import Image from "next/image";
import { Calendar, MapPin, Users, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { type Event } from "@/types";
import { Button } from "@/app/components/ui/Button";
import { toggleFavoriteEvent, isEventFavorited } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

interface EventCardProps {
    event: Event;
}

export function EventCard({ event }: EventCardProps) {
    const { user, signInWithGoogle } = useAuth();
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (user && event.id) {
            isEventFavorited(user.uid, event.id).then(setIsSaved);
        }
    }, [user, event.id]);

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            signInWithGoogle();
            return;
        }

        // Optimistic update
        const newState = !isSaved;
        setIsSaved(newState);

        try {
            await toggleFavoriteEvent(user.uid, event.id);
        } catch (error) {
            console.error("Error toggling favorite:", error);
            setIsSaved(!newState); // Revert on error
        }
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            {/* Image Container with Link */}
            <Link href={`/event-details?id=${event.id}`} className="relative aspect-[16/10] w-full overflow-hidden bg-white">
                <div className="relative h-full w-full">
                    <img
                        src={event.image}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Dark gradient overlay for better text visibility if needed, or just keep as is */}
                </div>

                {/* Badges - Positioned absolutely on top of the image */}
                {/* Share Button */}
                <div className="absolute left-3 top-3 z-10">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url = `${window.location.origin}/event-details?id=${event.id}`;
                            if (navigator.share) {
                                navigator.share({
                                    title: event.title,
                                    text: `Check out ${event.title} on CornerClub!`,
                                    url: url,
                                }).catch(() => { });
                            } else {
                                navigator.clipboard.writeText(url);
                                alert("Link copied to clipboard!");
                            }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-700 backdrop-blur-sm transition-colors hover:text-[#f98109]"
                    >
                        <Share2 className="h-4 w-4" />
                    </button>
                </div>

                {/* Price Badge */}
                <div className="absolute right-3 top-3 z-10">
                    <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-zinc-900 backdrop-blur-sm">
                        {event.price === 0 ? "Free" : `₹${event.price}`}
                    </span>
                </div>
            </Link>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                {/* Date & Location */}
                <div className="mb-2 flex items-center gap-3 text-xs font-medium text-[#f98109]">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: 'short' })} • {event.time}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.city}
                    </span>
                </div>

                <Link href={`/event-details?id=${event.id}`}>
                    <h3 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1 hover:text-[#f98109] transition-colors">{event.title}</h3>
                </Link>
                <p className="mb-4 text-sm text-zinc-500 line-clamp-2">{event.description}</p>

                {/* Footer info: Creator & Attendees */}
                <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="relative h-6 w-6 overflow-hidden rounded-full border border-zinc-200">
                            <img src={event.creator.avatar} alt={event.creator.name} className="h-full w-full object-cover" />
                        </div>
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-[100px]">{event.creator.name}</span>
                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-white border border-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        <Users className="h-3 w-3" />
                        {event.attendees} going
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <Link href={`/event-details?id=${event.id}`} className="flex-1">
                        <Button className="w-full">Book Ticket</Button>
                    </Link>
                    <button
                        onClick={handleFavorite}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border text-zinc-400 transition-colors dark:border-zinc-800 ${isSaved
                            ? "border-red-500 text-red-500"
                            : "border-zinc-200 hover:border-[#f98109] hover:text-[#f98109]"
                            }`}
                    >
                        <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}
