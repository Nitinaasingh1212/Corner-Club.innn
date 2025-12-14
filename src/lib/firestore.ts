import { collection, addDoc, getDocs, getDoc, setDoc, doc, query, orderBy, limit, onSnapshot, DocumentData, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { Event } from "@/data/mockData";

export const eventsCol = collection(db, "events");

export async function createEvent(data: Event) {
    // We use setDoc with fixed ID to ensure the document ID matches the internal ID
    // This makes routing /events/[id] simpler and consistent.
    await setDoc(doc(eventsCol, data.id), data);
}

export async function getEventsOrderedByDate() {
    const q = query(eventsCol, orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getEventById(id: string) {
    const docRef = doc(db, "events", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Event;
    }
    return null;
}

export async function bookEvent(eventId: string, userId: string, userDetails: any, quantity: number = 1) {
    const { runTransaction } = await import("firebase/firestore");

    try {
        await runTransaction(db, async (transaction) => {
            const eventRef = doc(db, "events", eventId);
            const eventDoc = await transaction.get(eventRef);

            if (!eventDoc.exists()) {
                throw "Event does not exist!";
            }

            const eventData = eventDoc.data();
            const currentAttendees = eventData.attendees || 0;
            const capacity = eventData.capacity || 0;

            if (currentAttendees + quantity > capacity) {
                throw `Not enough spots! Only ${capacity - currentAttendees} left.`;
            }

            // Create a booking reference
            const newBookingRef = doc(collection(db, "bookings"));

            transaction.set(newBookingRef, {
                eventId,
                userId,
                user: userDetails,
                quantity,
                totalPrice: (eventData.price || 0) * quantity,
                bookedAt: new Date().toISOString(),
                status: "confirmed"
            });

            // Update event attendees count
            transaction.update(eventRef, {
                attendees: currentAttendees + quantity
            });
        });
        console.log("Booking successful!");
        return true;
    } catch (e) {
        console.error("Booking failed: ", e);
        throw e;
    }
}

export async function getUserBookings(userId: string) {
    const { where } = await import("firebase/firestore");
    // Query bookings for this user
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    // For each booking, fetch the event details
    const bookings = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const bookingData = docSnap.data();
        const eventData = await getEventById(bookingData.eventId);
        return {
            id: docSnap.id,
            ...bookingData,
            event: eventData
        };
    }));

    return bookings;
}

// CHAT FUNCTIONALITY
export const messagesCol = collection(db, "messages");

export async function sendMessage(text: string, user: any) {
    await addDoc(messagesCol, {
        text,
        sender: user.displayName || "Anonymous",
        senderId: user.uid,
        avatar: user.photoURL || "",
        createdAt: serverTimestamp()
    });
}

export function subscribeToMessages(callback: (messages: any[]) => void) {
    const q = query(messagesCol, orderBy("createdAt", "asc"), limit(50));

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(messages);
    });
}
