/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getEventsOrderedByDate } from "@/lib/firestore";
import { Event } from "@/data/mockData"; // keep type definition

interface EventsContextType {
    events: Event[];
    addEvent: (event: Event) => void;
    loadMore: () => Promise<void>;
    hasMore: boolean;
    loading: boolean;
    refetch: (city: string, category: string) => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({ city: "All", category: "All" });

    // Helper to fetch events
    const fetchEventsList = async (isLoadMore: boolean = false, city: string = "All", category: string = "All") => {
        setLoading(true);
        try {
            let lastDate = undefined;
            let lastId = undefined;

            if (isLoadMore && events.length > 0) {
                const lastEvent = events[events.length - 1];
                lastDate = lastEvent.date;
                lastId = lastEvent.id;
            }

            const newEvents: any[] = await getEventsOrderedByDate(lastDate, lastId, city, category);

            if (newEvents.length < 50) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            if (isLoadMore) {
                setEvents(prev => [...prev, ...newEvents]);
            } else {
                setEvents(newEvents);
            }
        } catch (err) {
            console.error("Failed to fetch events:", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        // fetchEventsList(false, "All", "All"); 
        // We can let the component trigger the first fetch via refetch if we want, or do it here.
        // Let's do it here to ensure data on mount, but page.tsx might override.
        // Actually page.tsx has local state 'Lucknow'/'All'. 
        // It's better if page.tsx calls refetch on mount with its defaults.
        // But if we leave it empty here, context is empty initially.
        // Let's fetch default "All"/"All" here (or "Lucknow" if that's the desired default? 
        // The mock local state in page.tsx was "Lucknow".
        // Let's hold off auto-fetch here if we want page.tsx to drive it.
        // Or better: default to fetching All/All and let page.tsx refine it.
        // existing: fetches all.
        // I will trigger a default fetch here.
        fetchEventsList();
    }, []);

    const loadMore = async () => {
        if (!hasMore || loading) return;
        await fetchEventsList(true, filters.city, filters.category);
    };

    const refetch = async (city: string, category: string) => {
        setFilters({ city, category });
        setHasMore(true); // Reset hasMore on new filter
        await fetchEventsList(false, city, category);
    };

    const addEvent = async (event: Event) => {
        // Do NOT optimistic update, because event needs approval.
        // setEvents((prev) => [event, ...prev]); 
        try {
            const { createEvent } = await import("@/lib/firestore");
            await createEvent(event);
            // Optionally fetch events again? No, user needs to wait for approval.
        } catch (error: any) {
            console.error("Failed to save event to Firestore:", error);
            alert(`Error saving event: ${error.message}`);
        }
    };

    return (
        <EventsContext.Provider value={{ events, addEvent, loadMore, hasMore, loading, refetch }}>
            {children}
        </EventsContext.Provider>
    );
}

export function useEvents() {
    const context = useContext(EventsContext);
    if (context === undefined) {
        throw new Error("useEvents must be used within an EventsProvider");
    }
    return context;
}
