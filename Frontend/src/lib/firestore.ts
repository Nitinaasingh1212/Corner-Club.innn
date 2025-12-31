/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "./firebase"; // Still needed for auth? No, auth is separate. But db export might be used elsewhere? 
// Actually, we should remove direct firestore usage.
import { Event } from "@/data/mockData";

// Use relative URL to leverage Next.js rewrites (works in dev and prod)
// Use relative URL for client-side (Next.js rewrites) and absolute URL for server-side (static generation/ISR)
const API_URL = typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
    : "/api";
// const API_URL = "http://localhost:5000/api"; // DIRECT DEBUGGING

// We won't use this directly anymore for events, but might for other things if not fully migrated.
// However, the task is to separate. Let's assume we replace all logic in this file.

export async function createEvent(data: Event) {
    // This was previously writing to Firestore directly. 
    // We haven't implemented a createEvent endpoint yet in the backend plan, assuming it's needed?
    // Wait, the plan didn't explicitly list createEvent, but "Backend Event System Integration" was a past convo.
    // Let's implement it in the backend too just in case, or just error for now?
    // User asked to separate full backend and frontend. I should probably add createEvent to backend too.
    // But let's stick to what's defined in the file currently.
    // Actually, I'll add a TODO or try to implement it if I see it.
    // The previous file had createEvent. I should add it to backend.

    // For now I will implement the fetch call assuming endpoint exists or will exist.
    // I'll update server.js in a separate step if I missed it.
    // Actually, I should probably double check server.js. I didn't add POST /api/events.
    // Let's add it to server.js in a turbo step afterwards.

    const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw errorData.error || "Failed to create event";
    }
    return res.json();
}

export async function getEventsOrderedByDate() {
    const res = await fetch(`${API_URL}/events`);
    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
}

export async function getEventsForSitemap() {
    // Explicitly use the absolute URL for sitemap generation to avoid any environment ambiguity during build
    // This runs in Node.js on the server where we need the full URL
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/events`);
    if (!res.ok) throw new Error("Failed to fetch events for sitemap");
    return res.json();
}

export async function getEventById(id: string) {
    const res = await fetch(`${API_URL}/events/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch event");
    return res.json();
}

export async function bookEvent(eventId: string, userId: string, userDetails: any, quantity: number = 1) {
    const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, userId, userDetails, quantity })
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw errorData.error || "Booking failed";
    }
    return true;
}

export async function getUserBookings(userId: string) {
    const res = await fetch(`${API_URL}/users/${userId}/bookings`);
    if (!res.ok) throw new Error("Failed to fetch bookings");
    return res.json();
}

export async function getUserHostedEvents(userId: string) {
    const res = await fetch(`${API_URL}/users/${userId}/hosted-events`);
    if (!res.ok) throw new Error("Failed to fetch hosted events");
    return res.json();
}

// CHAT FUNCTIONALITY
// Providing direct firestore access for chat as it uses onSnapshot which is hard to REST-ify without websockets or polling.
// We'll keep chat on Firebase Client SDK for now as it's often treated as real-time service.
// But the user said "Separate FULL backend", usually implies data.
// Implementing a simple polling or keeping it as is?
// I will keep it using direct import for now but mark it.
// CHAT FUNCTIONALITY
// Providing direct firestore access for chat as it uses onSnapshot which is hard to REST-ify without websockets or polling.
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, setDoc, doc, getDoc } from "firebase/firestore";

export function getMessagesCol(eventId: string) {
    // Subcollection 'chat' under 'events/{eventId}'
    return collection(db, "events", eventId, "chat");
}

export async function sendMessage(eventId: string, text: string, user: any) {
    if (!eventId) return; // Guard
    await addDoc(getMessagesCol(eventId), {
        text,
        sender: user.displayName || "Anonymous",
        senderId: user.uid,
        avatar: user.photoURL || "",
        createdAt: serverTimestamp()
    });
}

export function subscribeToMessages(eventId: string, callback: (messages: any[]) => void) {
    if (!eventId) return () => { };
    const q = query(getMessagesCol(eventId), orderBy("createdAt", "asc"), limit(50));
    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(messages);
    });
}

// ATTENDEES (Organizer Only)
export async function getEventAttendees(eventId: string) {
    const res = await fetch(`${API_URL}/events/${eventId}/attendees`);
    if (!res.ok) throw new Error("Failed to fetch attendees");
    return res.json();
}

// USER PROFILE & PORTFOLIO
export async function getUserProfile(userId: string) {
    const res = await fetch(`${API_URL}/users/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch user profile");
    return res.json();
}

export async function updateUserProfile(userId: string, data: any) {
    const res = await fetch(`${API_URL}/users/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return res.json();
}

// FAVORITES FUNCTIONALITY
export async function toggleFavoriteEvent(userId: string, eventId: string) {
    const res = await fetch(`${API_URL}/favorites/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, eventId })
    });
    if (!res.ok) throw new Error("Failed to toggle favorite");
    const data = await res.json();
    return data.added; // Return true if added, false if removed
}

export async function isEventFavorited(userId: string, eventId: string) {
    if (!userId || !eventId) return false;
    const res = await fetch(`${API_URL}/users/${userId}/favorites/${eventId}/check`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.isFavorited;
}

export async function getFavoriteEvents(userId: string) {
    const res = await fetch(`${API_URL}/users/${userId}/favorites`);
    if (!res.ok) throw new Error("Failed to fetch favorites");
    return res.json();
}

