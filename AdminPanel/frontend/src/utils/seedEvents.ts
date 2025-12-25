import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MOCK_EVENTS, Event } from "@/data/mockData";

export async function seedEvents() {
    try {
        const eventsRef = collection(db, "events");
        const snapshot = await getDocs(eventsRef);

        if (!snapshot.empty) {
            console.log("Events collection directly has documents. Skipping seed.");
            return;
        }

        console.log("Seeding events...");
        const batch = writeBatch(db);

        MOCK_EVENTS.forEach((event) => {
            // Use the mock ID as the document ID for consistency
            const docRef = doc(eventsRef, event.id);

            // Sanitizing undefined values if any (Firestore doesn't like undefined)
            const eventData = JSON.parse(JSON.stringify(event));

            batch.set(docRef, eventData);
        });

        await batch.commit();
        console.log("Events seeded successfully!");
    } catch (error) {
        console.error("Error seeding events:", error);
    }
}
