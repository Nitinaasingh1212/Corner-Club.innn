const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
require('dotenv').config();

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

async function inspect() {
    console.log("--- PENDING EVENTS ---");
    const pending = await getDocs(collection(db, "pending_events"));
    pending.forEach(d => console.log(d.id, d.data().title, d.data().status, d.data().createdAt));

    console.log("\n--- EVENTS (APPROVED) ---");
    const events = await getDocs(collection(db, "events"));
    events.forEach(d => console.log(d.id, d.data().title, d.data().status, d.data().createdAt));

    console.log("\n--- REJECTED EVENTS ---");
    const rejected = await getDocs(collection(db, "rejected_events"));
    rejected.forEach(d => console.log(d.id, d.data().title, d.data().status, d.data().createdAt));
}

inspect();
