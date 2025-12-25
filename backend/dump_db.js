const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const fs = require('fs');

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

async function dump() {
    let output = "timestamp: " + new Date().toISOString() + "\n";

    output += "\n--- PENDING EVENTS ---\n";
    const pending = await getDocs(collection(db, "pending_events"));
    output += `Count: ${pending.size}\n`;
    pending.forEach(d => output += `[${d.id}] ${d.data().title} (${d.data().status})\n`);

    output += "\n--- EVENTS (APPROVED) ---\n";
    const events = await getDocs(collection(db, "events"));
    output += `Count: ${events.size}\n`;
    events.forEach(d => output += `[${d.id}] ${d.data().title} (${d.data().status})\n`);

    output += "\n--- REJECTED EVENTS ---\n";
    const rejected = await getDocs(collection(db, "rejected_events"));
    output += `Count: ${rejected.size}\n`;
    rejected.forEach(d => output += `[${d.id}] ${d.data().title} (${d.data().status})\n`);

    fs.writeFileSync('active_db_state.txt', output);
    console.log("Dump written to active_db_state.txt");
    process.exit(0);
}

dump();
