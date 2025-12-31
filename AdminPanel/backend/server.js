const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { db } = require('./firebase');
const { collection, getDocs, doc, getDoc, setDoc, updateDoc, runTransaction, query, where, orderBy, deleteDoc, serverTimestamp } = require("firebase/firestore");

const app = express();
const port = process.env.PORT || 5001;

// Allow both localhost:3000 (Main) and localhost:3001 (Admin) just in case
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified turn.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// --- Events API (Admin Read-Only mainly, but kept for compatibility if needed) ---
// Not used heavily by Admin Frontend except pending/history, but good for reference.
app.get('/api/events', async (req, res) => {
    // This endpoint on Admin Backend might not be used, but let's keep it safe.
    res.json([]);
});

// --- Admin API ---
// Using separate collections: "pending_events", "events" (approved), "rejected_events" (history)

// Get pending events from separate collection
app.get('/api/admin/events/pending', async (req, res) => {
    try {
        const eventsCol = collection(db, "pending_events");
        const snapshot = await getDocs(eventsCol);
        const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.json(events);
    } catch (error) {
        console.error("Error fetching pending events:", error);
        res.status(500).json({ error: "Failed to fetch pending events" });
    }
});

// Get History (Approved + Rejected)
app.get('/api/admin/events/history', async (req, res) => {
    try {
        const approvedSnap = await getDocs(collection(db, "events"));
        const rejectedSnap = await getDocs(collection(db, "rejected_events"));

        const approved = approvedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const rejected = rejectedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const allHistory = [...approved, ...rejected]
            .filter(e => e.status !== 'pending') // Double check to exclude any legacy pending items in 'events'
            .sort((a, b) => new Date(b.approvedAt || b.rejectedAt || b.createdAt) - new Date(a.approvedAt || a.rejectedAt || a.createdAt));

        res.json(allHistory);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// Approve event (Move Pending -> Events)
app.post('/api/admin/events/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const pendingRef = doc(db, "pending_events", id);
        const approvedRef = doc(db, "events", id);

        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(pendingRef);
            if (!sfDoc.exists()) {
                throw "Document does not exist in pending!";
            }

            const data = sfDoc.data();
            const newData = {
                ...data,
                status: 'approved',
                approvedAt: new Date().toISOString()
            };

            transaction.set(approvedRef, newData);
            transaction.delete(pendingRef);
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error approving event:", error);
        res.status(500).json({ error: "Failed to approve event" });
    }
});

// Reject event (Move Pending -> Rejected Events)
app.post('/api/admin/events/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const pendingRef = doc(db, "pending_events", id);
        const rejectedRef = doc(db, "rejected_events", id);

        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(pendingRef);
            if (!sfDoc.exists()) {
                throw "Document does not exist in pending!";
            }

            const data = sfDoc.data();
            const newData = {
                ...data,
                status: 'rejected',
                rejectedAt: new Date().toISOString()
            };

            transaction.set(rejectedRef, newData);
            transaction.delete(pendingRef);
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error rejecting event:", error);
        res.status(500).json({ error: "Failed to reject event" });
    }
});

app.get('/', (req, res) => {
    res.send('Admin Backend is running!');
});

// Export for Vercel
module.exports = app;

// Only start server if running locally
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
}
