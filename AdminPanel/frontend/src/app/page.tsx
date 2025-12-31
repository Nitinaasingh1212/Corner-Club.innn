"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

    useEffect(() => {
        // In real app maybe check user here
        fetchEvents();
    }, [activeTab]);

    const [selectedOrganizer, setSelectedOrganizer] = useState<any>(null);

    async function fetchEvents() {
        setLoading(true);
        try {
            const endpoint = activeTab === 'pending'
                ? `${API_BASE}/admin/events/pending`
                : `${API_BASE}/admin/events/history`;

            const res = await fetch(endpoint);
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleApprove = async (id: string) => {
        if (!confirm("Approve this event?")) return;
        try {
            await fetch(`${API_BASE}/admin/events/${id}/approve`, { method: "POST" });
            setEvents(prev => prev.filter(e => e.id !== id));
            alert("Event approved!");
        } catch (error) {
            alert("Error approving event");
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Reject and archive this event?")) return;
        try {
            await fetch(`${API_BASE}/admin/events/${id}/reject`, { method: "POST" });
            setEvents(prev => prev.filter(e => e.id !== id));
            alert("Event rejected!");
        } catch (error) {
            alert("Error rejecting event");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 pt-10 pb-20 dark:bg-black">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
                    <div className="flex bg-white dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'pending' ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'history' ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            History
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-white"></div>
                    </div>
                ) : events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-zinc-200 rounded-2xl dark:border-zinc-800">
                        <div className="text-zinc-400 mb-2 text-6xl">📭</div>
                        <p className="text-lg font-medium text-zinc-900 dark:text-white">No events found.</p>
                        <p className="text-sm text-zinc-500">
                            {activeTab === 'pending' ? "All caught up! No approved events pending." : "No history available yet."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {events.map((event) => (
                            <div key={event.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className={`absolute top-3 right-3 z-10 rounded-full px-3 py-1 text-xs font-semibold ${event.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    event.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                    {event.status === 'pending' ? 'Pending Review' : (event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Unknown')}
                                </div>

                                <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100 relative">
                                    <img
                                        src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}
                                        alt={event.title}
                                        onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30")}
                                        className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${event.status !== 'pending' ? 'grayscale-[20%]' : ''}`}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                    <div className="absolute bottom-3 left-4 text-white">
                                        <p className="font-semibold text-lg">{new Date(event.date || event.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-2">
                                        <h3 className="line-clamp-1 text-lg font-bold text-zinc-900 dark:text-white">{event.title}</h3>
                                        <p className="text-sm text-zinc-500">{event.city}</p>
                                    </div>
                                    <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400 mb-6 flex-1">{event.description}</p>

                                    <div className="mb-4 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-200 mb-1">Organized by:</p>
                                                <p className="truncate w-full">👤 {event.organizer?.name || 'Unknown'}</p>
                                                <p className="truncate w-full">📞 {event.organizer?.phone || 'N/A'}</p>
                                                <p className="truncate w-full">✉️ {event.organizer?.email || 'N/A'}</p>
                                            </div>
                                            {event.organizer && (
                                                <button
                                                    onClick={() => setSelectedOrganizer(event.organizer)}
                                                    className="text-xs bg-zinc-900 text-white dark:bg-white dark:text-black px-2 py-1 rounded hover:opacity-80 transition-opacity"
                                                >
                                                    View Profile
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {activeTab === 'pending' ? (
                                        <div className="flex gap-3 mt-auto">
                                            <Button
                                                onClick={() => handleApprove(event.id)}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
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
                                    ) : (
                                        <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                            <p className="text-xs text-zinc-500 text-center">
                                                {event.status === 'approved'
                                                    ? `Approved on ${new Date(event.approvedAt || event.createdAt).toLocaleDateString()}`
                                                    : `Rejected on ${new Date(event.rejectedAt || event.createdAt).toLocaleDateString()}`
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Organizer Profile Modal */}
                {selectedOrganizer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrganizer(null)}>
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                                <button
                                    onClick={() => setSelectedOrganizer(null)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                                >
                                    ✕
                                </button>
                                <div className="absolute -bottom-10 left-6">
                                    <div className="h-20 w-20 rounded-full border-4 border-white dark:border-zinc-900 bg-zinc-200 overflow-hidden">
                                        <img
                                            src={selectedOrganizer.photoURL || selectedOrganizer.photo || "https://api.dicebear.com/7.x/avataaars/svg"}
                                            alt={selectedOrganizer.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-12 px-6 pb-6">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{selectedOrganizer.name}</h2>
                                <p className="text-sm text-zinc-500 mb-4">{selectedOrganizer.city || "No location set"}</p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                        <span className="w-5 text-center">✉️</span>
                                        <a href={`mailto:${selectedOrganizer.email}`} className="hover:text-blue-500">{selectedOrganizer.email}</a>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                        <span className="w-5 text-center">📞</span>
                                        <span>{selectedOrganizer.phone || "No phone number"}</span>
                                    </div>
                                </div>

                                {selectedOrganizer.bio && (
                                    <div className="mb-6 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Bio</h3>
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300">{selectedOrganizer.bio}</p>
                                    </div>
                                )}

                                {selectedOrganizer.social && Object.keys(selectedOrganizer.social).length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Social Links</h3>
                                        <div className="flex gap-2">
                                            {Object.entries(selectedOrganizer.social).map(([platform, link]: [string, any]) => (
                                                <a
                                                    key={platform}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors capitalize"
                                                >
                                                    {platform}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
