const { db } = require('./firebase');
const { collection, getDocs, query, where } = require("firebase/firestore");

async function testFetch() {
    try {
        console.log("Attempting to fetch approved events...");
        const eventsCol = collection(db, "events");
        const q = query(eventsCol, where("status", "==", "approved"));
        const snapshot = await getDocs(q);
        console.log(`Successfully fetched ${snapshot.docs.length} events.`);
    } catch (error) {
        console.error("FULL ERROR OBJECT:", error);
        console.error("ERROR CODE:", error.code);
        console.error("ERROR MESSAGE:", error.message);
    }
}

testFetch();
