"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getEventsOrderedByDate } from "@/lib/firestore";
import { Event } from "@/types"; // keep type definition

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
                const data = await getEventsOrderedByDate();
                setEvents(data as Event[]);
            } catch (err) {
                console.error("Failed to fetch events:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

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
