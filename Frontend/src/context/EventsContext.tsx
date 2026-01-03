/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { getEventsOrderedByDate } from "@/lib/firestore";
import { Event } from "@/types"; // keep type definition

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

    // Refs to break dependency cycles in useCallback
    const eventsRef = useRef<Event[]>([]);
    const hasMoreRef = useRef(true);
    const filtersRef = useRef({ city: "All", category: "All" });

    // Sync refs with state
    useEffect(() => {
        eventsRef.current = events;
    }, [events]);

    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);


    // Helper to fetch events - Stable Identity
    const fetchEventsList = useCallback(async (isLoadMore: boolean = false, city: string = "All", category: string = "All") => {
        setLoading(true);
        try {
            let lastDate = undefined;
            let lastId = undefined;

            if (isLoadMore && eventsRef.current.length > 0) {
                const lastEvent = eventsRef.current[eventsRef.current.length - 1];
                lastDate = lastEvent.date;
                lastId = lastEvent.id;
            }

            const newEvents: any[] = await getEventsOrderedByDate(lastDate, lastId, city, category);

            if (newEvents.length < 50) {
                setHasMore(false);
                hasMoreRef.current = false;
            } else {
                setHasMore(true);
                hasMoreRef.current = true;
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
    }, []); // No dependencies = Stable function identity

    // Initial load
    useEffect(() => {
        fetchEventsList();
    }, [fetchEventsList]);

    const loadMore = useCallback(async () => {
        if (!hasMoreRef.current || loading) return;
        // Use ref values for filters to avoid dependency on state
        await fetchEventsList(true, filtersRef.current.city, filtersRef.current.category);
    }, [fetchEventsList, loading]); // loading is primitive, safe enough, but ideally we use ref for loading too if it changes fast. 
    // Actually, loading changes frequently. But loadMore is attached to button, not useEffect. So it's fine if it changes.

    // CRITICAL: refetch must be stable for page.tsx useEffect
    const refetch = useCallback(async (city: string, category: string) => {
        setFilters({ city, category }); // State update
        filtersRef.current = { city, category }; // Ref update immediately for the fetch below

        setHasMore(true);
        hasMoreRef.current = true;

        await fetchEventsList(false, city, category);
    }, [fetchEventsList]);

    const addEvent = async (event: Event) => {
        try {
            const { createEvent } = await import("@/lib/firestore");
            await createEvent(event);
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
