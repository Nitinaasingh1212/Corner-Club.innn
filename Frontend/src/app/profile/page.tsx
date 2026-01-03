/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserBookings, getFavoriteEvents, getUserHostedEvents, getUserProfile, updateUserProfile } from "@/lib/firestore";
import { Button } from "@/app/components/ui/Button";
import { EventCard } from "@/app/components/EventCard";
import { Settings, LogOut, Heart, Clock, Image as ImageIcon, Trash2, Plus, Users } from "lucide-react";
import { AttendeeModal } from "@/app/components/AttendeeModal";

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [fetchingBookings, setFetchingBookings] = useState(true);
    const [savedEvents, setSavedEvents] = useState<any[]>([]);
    const [fetchingFavorites, setFetchingFavorites] = useState(true);
    const [hostedEvents, setHostedEvents] = useState<any[]>([]);
    const [fetchingHosted, setFetchingHosted] = useState(true);

    // Portfolio State
    const [portfolio, setPortfolio] = useState<string[]>([]);
    const [newImage, setNewImage] = useState("");
    const [updatingPortfolio, setUpdatingPortfolio] = useState(false);

    // Profile Data State
    const [profileData, setProfileData] = useState<any>({});

    const [savingProfile, setSavingProfile] = useState(false);

    // Attendee Modal State
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchData() {
            if (user) {
                // Bookings
                getUserBookings(user.uid).then(setBookings).catch(console.error).finally(() => setFetchingBookings(false));

                // Favorites
                getFavoriteEvents(user.uid).then(setSavedEvents).catch(console.error).finally(() => setFetchingFavorites(false));

                // Hosted
                getUserHostedEvents(user.uid).then(setHostedEvents).catch(console.error).finally(() => setFetchingHosted(false));

                // Profile (Portfolio & Details)
                getUserProfile(user.uid).then(data => {
                    if (data) {
                        if (data.portfolio) setPortfolio(data.portfolio);
                        setProfileData(data);
                    }
                }).catch(console.error);
            }
        }
        fetchData();
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setSavingProfile(true);
        try {
            await updateUserProfile(user.uid, profileData);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleAddImage = async () => {
        if (!newImage.trim() || !user) return;

        const updatedPortfolio = [...portfolio, newImage.trim()];
        setPortfolio(updatedPortfolio);
        setNewImage("");
        setUpdatingPortfolio(true);

        try {
            await updateUserProfile(user.uid, { portfolio: updatedPortfolio });
        } catch (error) {
            console.error("Failed to update portfolio", error);
            alert("Failed to save image.");
        } finally {
            setUpdatingPortfolio(false);
        }
    };

    const handleDeleteImage = async (index: number) => {
        if (!user) return;
        const updatedPortfolio = portfolio.filter((_, i) => i !== index);
        setPortfolio(updatedPortfolio);
        setUpdatingPortfolio(true);

        try {
            await updateUserProfile(user.uid, { portfolio: updatedPortfolio });
        } catch (error) {
            console.error("Failed to update portfolio", error);
            alert("Failed to delete image.");
        } finally {
            setUpdatingPortfolio(false);
        }
    };

    if (loading) return null; // or a spinner
    if (!user) return null; // redirecting

    return (
        <div className="min-h-screen bg-zinc-50 pt-20 pb-20 dark:bg-black">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Profile Header */}
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 sm:p-10 mb-8">
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

                    {/* Profile Editing Section */}
                    <div className="mt-8 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Edit Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={profileData.phone || ""}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">City</label>
                                <input
                                    type="text"
                                    value={profileData.city || ""}
                                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                                    placeholder="New York, NY"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Bio</label>
                                <textarea
                                    value={profileData.bio || ""}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                                    rows={3}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button onClick={handleSaveProfile} disabled={savingProfile}>
                                {savingProfile ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Portfolio Section */}
                <div className="mb-12 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-purple-500" />
                        Organizer Portfolio
                    </h2>
                    <p className="text-sm text-zinc-500 mb-6">
                        Upload photos of your past events to showcase your work on your event pages.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                        {portfolio.map((img, idx) => (
                            <div key={idx} className="relative aspect-square group rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                <img src={img} alt="Portfolio" className="h-full w-full object-cover" />
                                <button
                                    onClick={() => handleDeleteImage(idx)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 max-w-lg">
                        <input
                            type="text"
                            value={newImage}
                            onChange={(e) => setNewImage(e.target.value)}
                            placeholder="Enter Image URL (e.g. from Unsplash)..."
                            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#f98109] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                        />
                        <Button onClick={handleAddImage} disabled={updatingPortfolio || !newImage.trim()}>
                            {updatingPortfolio ? "Saving..." : <><Plus className="h-4 w-4 mr-1" /> Add</>}
                        </Button>
                    </div>
                    {/* Helper text for demo */}
                    <p className="text-xs text-zinc-400 mt-2">
                        Tip: Open image in new tab, copy image address, and paste here.
                    </p>
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
                            <p className="mt-2 text-zinc-500">You haven&apos;t booked any events yet.</p>
                            <Button className="mt-6" onClick={() => router.push("/")}>
                                Explore Events
                            </Button>
                        </div>
                    )}
                </div>

                {/* Hosted Events Section */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Events Hosted by You</h2>

                    {fetchingHosted ? (
                        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-80 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"></div>
                            ))}
                        </div>
                    ) : hostedEvents.length > 0 ? (
                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {hostedEvents.map((event) => (
                                <div key={event.id} className="relative">
                                    <div className={`absolute left-4 top-3 z-20 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm ${event.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'
                                        }`}>
                                        {event.status === 'approved' ? 'Listed' : 'Pending Approval'}
                                    </div>
                                    {/* Disable clicking if pending */}
                                    <div className={event.status !== 'approved' ? 'opacity-75 pointer-events-none' : ''}>
                                        <EventCard event={event} />
                                    </div>
                                    <div className="mt-2">
                                        <Button
                                            variant="outline"
                                            className="w-full text-zinc-600 dark:text-zinc-300 border-dashed"
                                            onClick={() => setSelectedEventId(event.id)}
                                        >
                                            <Users className="mr-2 h-4 w-4" />
                                            View Attendees
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-12 flex flex-col items-center justify-center text-center">
                            <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-900">
                                <Clock className="h-12 w-12 text-zinc-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">No hosted events</h3>
                            <p className="mt-2 text-zinc-500">You haven&apos;t hosted any events yet.</p>
                            <Button className="mt-6" variant="outline" onClick={() => {
                                // Trigger host event modal logic (need to pass this down or just redirect)
                                // Simpler to redirect to home where the button is visible or just show text
                                router.push("/");
                            }}>
                                Host an Event
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
            {selectedEventId && (
                <AttendeeModal
                    eventId={selectedEventId}
                    onClose={() => setSelectedEventId(null)}
                />
            )}
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
