const { db } = require('./firebase');
const { collection, getDocs, query, where } = require("firebase/firestore");

async function checkPending() {
    try {
        console.log("Checking for PENDING events...");
        const eventsCol = collection(db, "events");
        const q = query(eventsCol, where("status", "==", "pending"));
        const snapshot = await getDocs(q);

        console.log(`Found ${snapshot.docs.length} pending events.`);
        snapshot.docs.forEach(doc => {
            console.log(`- ID: ${doc.id}, Title: ${doc.data().title}, CreatedAt: ${doc.data().createdAt}`);
        });

        if (snapshot.docs.length === 0) {
            console.log("No pending events found. Let's check ALL events to see if status is wrong.");
            const allSnap = await getDocs(collection(db, "events"));
            console.log(`Total events in DB: ${allSnap.docs.length}`);
            allSnap.docs.forEach(doc => {
                console.log(`  > ID: ${doc.id}, Status: ${doc.data().status}, Title: ${doc.data().title}`);
            });
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

checkPending();
