const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, where, writeBatch } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyDo58NCa9U7QCaTuGcLRbykXlDmNjXp0fA",
    authDomain: "new-event-e2a38.firebaseapp.com",
    projectId: "new-event-e2a38",
    storageBucket: "new-event-e2a38.firebasestorage.app",
    messagingSenderId: "598259162044",
    appId: "1:598259162044:web:792f128e63a59f86b6a9b9",
    measurementId: "G-GSNG6W9J9G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function repair() {
    console.log("Starting DB Repair...");
    const eventsRef = collection(db, "events");
    // Find all events that are marked as pending but stuck in the wrong collection
    const q = query(eventsRef, where("status", "==", "pending"));
    const snapshot = await getDocs(q);

    console.log(`Found ${snapshot.size} incorrectly placed pending events.`);

    if (snapshot.empty) {
        console.log("No repairs needed.");
        process.exit(0);
    }

    const batch = writeBatch(db);

    snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const pendingRef = doc(db, "pending_events", docSnap.id);
        const oldRef = doc(db, "events", docSnap.id);

        console.log(`Moving ${docSnap.id}: ${data.title}`);
        batch.set(pendingRef, data);
        batch.delete(oldRef);
    });

    await batch.commit();
    console.log("Repair complete. All pending events moved to 'pending_events'.");
    process.exit(0);
}

repair();
