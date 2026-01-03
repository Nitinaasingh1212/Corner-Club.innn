const { db } = require('./firebase');
const { collection, getDocs } = require("firebase/firestore");

async function checkDB() {
    try {
        console.log("Fetching events from Firestore...");
        const snapshot = await getDocs(collection(db, "events"));
        const events = snapshot.docs.map(doc => ({ id: doc.id, title: doc.data().title, creatorId: doc.data().creatorId }));

        console.log(`Found ${events.length} events:`);
        events.forEach(e => console.log(`- [${e.id}] ${e.title} (Creator: ${e.creatorId})`));

        const pendingSnapshot = await getDocs(collection(db, "pending_events"));
        console.log(`\nFound ${pendingSnapshot.size} pending events.`);
    } catch (error) {
        console.error("Error:", error);
    }
}

checkDB();
