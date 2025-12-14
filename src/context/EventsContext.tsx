"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getEventsOrderedByDate } from "@/lib/firestore";
import { Event } from "@/data/mockData"; // keep type definition

interface EventsContextType {
    events: Event[];
    addEvent: (event: Event) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    // Load events from Firestore on mount
    useEffect(() => {
        async function fetchEvents() {
            setLoading(true);
            try {
                // Check if we need to seed data (e.g. if it's the first run)
                // In a real app, this might be a separate admin script, 
                // but for this demo request we'll do it here to ensure data exists.
                const { seedEvents } = await import("@/utils/seedEvents");
                await seedEvents();

                const data = await getEventsOrderedByDate();

                if (data.length === 0) {
                    console.warn("Firestore returned 0 events. Using mock data.");
                    const { MOCK_EVENTS } = await import("@/data/mockData");
                    setEvents(MOCK_EVENTS);

                    // Auto-seed the database so it's not empty next time
                    const { seedEvents } = await import("@/utils/seedEvents");
                    await seedEvents();
                } else {
                    setEvents(data as Event[]);
                }
            } catch (err) {
                console.error("Failed to fetch events:", err);
                console.warn("Falling back to local mock data due to error.");
                // Fallback to local data so the app isn't empty
                const { MOCK_EVENTS } = await import("@/data/mockData");
                setEvents(MOCK_EVENTS);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    const addEvent = async (event: Event) => {
        // Optimistically add to UI
        setEvents((prev) => [event, ...prev]);
        try {
            const { createEvent } = await import("@/lib/firestore");
            await createEvent(event);
        } catch (error: any) {
            console.error("Failed to save event to Firestore:", error);
            alert(`Error saving event: ${error.message}. Check your Firebase Console > Firestore Rules.`);
        }
    };

    return (
        <EventsContext.Provider value={{ events, addEvent }}>
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
