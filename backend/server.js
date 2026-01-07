const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { db } = require('./firebase');
const { collection, getDocs, doc, getDoc, setDoc, updateDoc, runTransaction, query, where, orderBy, deleteDoc, serverTimestamp, limit, startAfter } = require("firebase/firestore");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// --- Events API ---

// Get all approved events (ordered by date)
app.get('/api/events', async (req, res) => {
    try {
        const { limit: limitParam, lastDate, lastId, city, category } = req.query;
        const limitVal = parseInt(limitParam) || 50;
        const eventsCol = collection(db, "events");

        // Base constraints: only approved events
        const constraints = [where("status", "==", "approved")];

        // Add filters
        if (city && city !== "All") constraints.push(where("city", "==", city));
        if (category && category !== "All") constraints.push(where("category", "==", category));

        // Sorting
        // Note: Firestore requires an index for where() + orderBy().
        // User must create the index link shown in server console if it fails.
        // We order by date desc, then ID desc for stable pagination.
        constraints.push(orderBy("date", "desc"));
        constraints.push(orderBy("__name__", "desc"));

        // Pagination Cursor
        if (lastDate && lastId) {
            constraints.push(startAfter(lastDate, lastId));
        }

        constraints.push(limit(limitVal));

        const q = query(eventsCol, ...constraints);
        const snapshot = await getDocs(q);
        const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events. Ensure Firestore indexes are created." });
    }
});

// Create new event
app.post('/api/events', async (req, res) => {
    try {
        const eventData = req.body;
        // Basic validation: ensure ID exists or generate one? 
        // Frontend generates ID usually in this codebase (mock data pattern).
        // Let's ensure we use the ID from body if present, or doc() auto-ID if not.

        // Always enforce status='pending' and createdAt for new events
        const newEventData = {
            ...eventData,
            status: 'pending',
            createdAt: eventData.createdAt || new Date().toISOString()
        };

        let docRef;
        // If ID exists (shouldn't really happen for new creates but logic exists), use it
        if (eventData.id) {
            // Note: If updating, check where it lives. For create, assumed new.
            docRef = doc(db, "pending_events", eventData.id);
            console.log("Using provided ID, writing to:", docRef.path);
            await setDoc(docRef, newEventData);
        } else {
            // Create in pending_events
            const newDocRef = doc(collection(db, "pending_events"));
            newEventData.id = newDocRef.id;
            console.log("Generated new ID, writing to:", newDocRef.path);
            await setDoc(newDocRef, newEventData);
        }

        res.json({ success: true, message: "Event created successfully", id: newEventData.id });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Failed to create event" });
    }
});

// Get single event by ID
app.get('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let docRef = doc(db, "events", id);
        let docSnap = await getDoc(docRef);

        // If not found in active events, check pending
        if (!docSnap.exists()) {
            docRef = doc(db, "pending_events", id);
            docSnap = await getDoc(docRef);
        }

        if (docSnap.exists()) {
            res.json({ id: docSnap.id, ...docSnap.data() });
        } else {
            res.status(404).json({ error: "Event not found" });
        }
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({ error: "Failed to fetch event" });
    }
});

// --- Admin API ---

// --- Admin API ---

// --- Admin API ---

// Get pending events
app.get('/api/admin/events/pending', async (req, res) => {
    try {
        const { limit: limitParam, lastCreatedAt, lastId } = req.query;
        const limitVal = parseInt(limitParam) || 50;
        const pendingCol = collection(db, "pending_events");

        const constraints = [];

        // Sort by creation time usually
        constraints.push(orderBy("createdAt", "desc"));
        constraints.push(orderBy("__name__", "desc"));

        if (lastCreatedAt && lastId) {
            constraints.push(startAfter(lastCreatedAt, lastId));
        }

        constraints.push(limit(limitVal));

        const q = query(pendingCol, ...constraints);
        const querySnapshot = await getDocs(q);
        const events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(events);
    } catch (error) {
        console.error("Error fetching pending events:", error);
        res.status(500).json({ error: "Failed to fetch pending events" });
    }
});

// Get event history (Approved + Rejected)
app.get('/api/admin/events/history', async (req, res) => {
    try {
        const approvedSnap = await getDocs(collection(db, "events"));
        const rejectedSnap = await getDocs(collection(db, "rejected_events"));

        const approved = approvedSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), status: 'approved' }));
        const rejected = rejectedSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), status: 'rejected' }));

        const allHistory = [...approved, ...rejected]
            .filter(e => e.status !== 'pending')
            .sort((a, b) => new Date(b.approvedAt || b.rejectedAt || b.createdAt) - new Date(a.approvedAt || a.rejectedAt || a.createdAt));

        res.json(allHistory);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// Approve event (Transaction: Pending -> Events)
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

        res.json({ success: true, message: "Event approved" });
    } catch (error) {
        console.error("Error approving event:", error);
        res.status(500).json({ error: "Failed to approve event" });
    }
});

// Reject event (Transaction: Pending -> Rejected Events)
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

        res.json({ success: true, message: "Event rejected" });
    } catch (error) {
        console.error("Error rejecting event:", error);
        res.status(500).json({ error: "Failed to reject event" });
    }
});

// --- User API ---
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            res.json(docSnap.data());
        } else {
            // Return null or 404? 
            // Better to return 200 with null so frontend can handle empty state gracefully
            res.json(null);
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

app.post('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.body;
        const docRef = doc(db, "users", id);

        // Use setDoc with merge: true to handle both create and update
        await setDoc(docRef, { ...userData, updatedAt: new Date().toISOString() }, { merge: true });

        res.json({ success: true });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Failed to update user" });
    }
});

// --- Bookings API ---

// Create a booking
// Create a booking
// Create a booking
app.post('/api/bookings', async (req, res) => {
    console.log("RECEIVED BOOKING REQUEST:", req.body); // DEBUG LOG
    try {
        const { eventId, userId, userDetails, quantity } = req.body;
        const { sendConfirmationEmail, sendBookingNotification } = require('./emailService');

        const bookingResult = await runTransaction(db, async (transaction) => {
            const eventRef = doc(db, "events", eventId);
            const eventDoc = await transaction.get(eventRef);

            // If not found in active events, check pending (though normally you don't book pending events, 
            // but for safety or draft flows)
            let eventData, refToUse;
            if (eventDoc.exists()) {
                eventData = eventDoc.data();
                refToUse = eventRef;
            } else {
                throw "Event does not exist!";
            }
            const currentAttendees = eventData.attendees || 0;
            const capacity = eventData.capacity || 0;

            if (currentAttendees + quantity > capacity) {
                throw `Not enough spots! Only ${capacity - currentAttendees} left.`;
            }

            // Calculate Seat Numbers
            const startSeat = currentAttendees + 1;
            const seatNumbers = Array.from({ length: quantity || 1 }, (_, i) => `#${startSeat + i}`);

            // Create a booking reference
            const newBookingRef = doc(collection(db, "bookings"));
            const bookingId = newBookingRef.id;

            const bookingData = {
                id: bookingId,
                eventId,
                userId,
                user: userDetails,
                quantity: quantity || 1,
                seatNumbers, // Store assigned seats
                totalPrice: (eventData.price || 0) * (quantity || 1),
                bookedAt: new Date().toISOString(),
                status: "confirmed"
            };

            transaction.set(newBookingRef, bookingData);

            // Update event attendees count
            transaction.update(eventRef, {
                attendees: currentAttendees + (quantity || 1)
            });

            return { booking: bookingData, event: eventData };
        });

        // Send Email Async (don't block response)
        // Send Email Async (don't block response)
        const fs = require('fs');
        sendConfirmationEmail(userDetails.email, bookingResult.booking, bookingResult.event)
            .then(success => {
                const log = `${new Date().toISOString()} - SUCCESS - Sent to ${userDetails.email}\n`;
                console.log(log);
                fs.appendFileSync('email.log', log);
            })
            .catch(err => {
                const log = `${new Date().toISOString()} - FAIL - ${userDetails.email} - ${err}\n`;
                console.error("Email sending failed:", err);
                fs.appendFileSync('email.log', log);
            });

        // Notify Organizer & Admin
        // Fetch Organizer Email first
        const organizerRef = doc(db, "users", bookingResult.event.creatorId); // Assuming creatorId links to 'users'
        // If creatorId points to a user that might not have an email in 'users' doc (only auth), this is tricky.
        // Assuming 'users' doc has email, or we rely on 'creatorId' being an email (unlikely).
        // Let's try to fetch user doc.
        getDoc(organizerRef).then(orgSnap => {
            const orgData = orgSnap.exists() ? orgSnap.data() : {};
            const organizerEmail = orgData.email; // Ensure your users collection has email!
            const adminEmail = process.env.EMAIL_USER; // Sent to site owner

            if (organizerEmail || adminEmail) {
                sendBookingNotification(organizerEmail, adminEmail, bookingResult.booking, bookingResult.event)
                    .then(success => {
                        const log = `${new Date().toISOString()} - NOTIFICATION SUCCESS - Sent to Org: ${organizerEmail || 'N/A'}, Admin: ${adminEmail}\n`;
                        console.log(log);
                        fs.appendFileSync('email.log', log);
                    })
                    .catch(err => {
                        const log = `${new Date().toISOString()} - NOTIFICATION FAIL - Org: ${organizerEmail}, Admin: ${adminEmail} - ${err}\n`;
                        console.error("Notification email sending failed:", err);
                        fs.appendFileSync('email.log', log);
                    });
            }
        });

        res.json({ success: true, message: "Booking successful", bookingId: bookingResult.booking.id });
    } catch (error) {
        console.error("Booking failed:", error);
        res.status(400).json({ error: error.toString() });
    }
});


// Get attendees for an event (Organizer/Admin only)
app.get('/api/events/:eventId/bookings', async (req, res) => {
    try {
        const { eventId } = req.params;
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, where("eventId", "==", eventId));
        const snapshot = await getDocs(q);

        const attendees = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                user: {
                    name: data.user?.name || "Anonymous",
                    phone: data.user?.phone || "N/A",
                    email: data.user?.email || "N/A"
                },
                quantity: data.quantity,
                totalPrice: data.totalPrice,
                bookedAt: data.bookedAt
            };
        });

        res.json(attendees);
    } catch (error) {
        console.error("Error fetching attendees:", error);
        res.status(500).json({ error: "Failed to fetch attendees" });
    }
});

// Get user bookings
app.get('/api/users/:userId/bookings', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit: limitParam, lastBookedAt, lastId } = req.query;
        const limitVal = parseInt(limitParam) || 50;

        const bookingsRef = collection(db, "bookings");

        // allow querying without index by removing orderBy
        const q = query(bookingsRef, where("userId", "==", userId));
        const snapshot = await getDocs(q);

        let bookings = await Promise.all(snapshot.docs.map(async (docSnap) => {
            const bookingData = docSnap.data();
            // Fetch event details for each booking
            const eventRef = doc(db, "events", bookingData.eventId);
            const eventSnap = await getDoc(eventRef);
            const eventData = eventSnap.exists() ? { id: eventSnap.id, ...eventSnap.data() } : null;

            return {
                id: docSnap.id,
                ...bookingData,
                event: eventData
            };
        }));

        // Sort in memory (Newest First)
        bookings.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));

        // Apply pagination limit manually if needed (optional, just returning all for now as list is small)
        // const limitVal = parseInt(limitParam) || 50;
        // bookings = bookings.slice(0, limitVal);

        res.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// Get user hosted events (Approved + Pending)
app.get('/api/users/:userId/hosted-events', async (req, res) => {
    try {
        const { userId } = req.params;

        // Query approved events
        const eventsRef = collection(db, "events");
        const qEvents = query(eventsRef, where("creatorId", "==", userId));
        const snapEvents = await getDocs(qEvents);
        const approvedEvents = snapEvents.docs.map(doc => ({ id: doc.id, ...doc.data(), status: 'approved' }));

        // Query pending events
        const pendingRef = collection(db, "pending_events");
        const qPending = query(pendingRef, where("creatorId", "==", userId));
        const snapPending = await getDocs(qPending);
        const pendingEvents = snapPending.docs.map(doc => ({ id: doc.id, ...doc.data(), status: 'pending' }));

        // Merge results
        res.json([...approvedEvents, ...pendingEvents]);
    } catch (error) {
        console.error("Error fetching hosted events:", error);
        res.status(500).json({ error: "Failed to fetch hosted events" });
    }
});

// --- User & Organiser API ---

// Get User Profile
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userDoc = await getDoc(doc(db, "users", id));
        if (userDoc.exists()) {
            res.json(userDoc.data());
        } else {
            // Return null or 404? Frontend expects null sometimes or just empty. 
            // Better to return 200 with null to handle "not created yet" gracefully in frontend
            res.json(null);
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// Update/Create User Profile
app.post('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const profileData = req.body;

        // Remove undefined fields to avoid Firestore errors
        const cleanData = JSON.parse(JSON.stringify(profileData));

        await setDoc(doc(db, "users", id), cleanData, { merge: true });
        res.json({ success: true, message: "Profile updated" });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// Get Event Attendees (Organizer Only)


// Update User specific fields (Portfolio, Socials, Verification)
// Using setDoc with merge: true to avoid overwriting everything
app.post('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userData = req.body; // Expects { portfolio: [], social: {}, isVerified: bool, etc }

        const userRef = doc(db, "users", userId);
        await setDoc(userRef, userData, { merge: true });

        res.json({ success: true, message: "User profile updated" });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Failed to update user" });
    }
});

// Get User Profile (Public)
app.get('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            res.json({ id: userSnap.id, ...userSnap.data(), isVerified: true });
        } else {
            // User might exist in Auth but not in 'users' collection yet if they haven't saved extra data.
            // Return minimal or empty but verified
            res.json({ id: userId, isVerified: true });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

// --- Favorites API ---

// Get user favorites
app.get('/api/users/:userId/favorites', async (req, res) => {
    try {
        const { userId } = req.params;
        const favColRef = collection(db, "users", userId, "favorites");
        const favSnapshot = await getDocs(favColRef);

        const favoriteEvents = await Promise.all(favSnapshot.docs.map(async (favDoc) => {
            const eventId = favDoc.data().eventId;
            // Fetch event details
            const eventRef = doc(db, "events", eventId);
            const eventSnap = await getDoc(eventRef);
            return eventSnap.exists() ? { id: eventSnap.id, ...eventSnap.data() } : null;
        }));

        // Filter out nulls
        res.json(favoriteEvents.filter(e => e !== null));
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
});

// Check if event is favorited
app.get('/api/users/:userId/favorites/:eventId/check', async (req, res) => {
    try {
        const { userId, eventId } = req.params;
        const favRef = doc(db, "users", userId, "favorites", eventId);
        const favSnap = await getDoc(favRef);
        res.json({ isFavorited: favSnap.exists() });
    } catch (error) {
        console.error("Error checking favorite:", error);
        res.status(500).json({ error: "Failed to check favorite" });
    }
});

// Toggle favorite
app.post('/api/favorites/toggle', async (req, res) => {
    try {
        const { userId, eventId } = req.body;
        const favRef = doc(db, "users", userId, "favorites", eventId);
        const favSnap = await getDoc(favRef);

        let added = false;
        if (favSnap.exists()) {
            await deleteDoc(favRef);
            added = false;
        } else {
            await setDoc(favRef, {
                eventId,
                savedAt: serverTimestamp() // Note: This might need handling if client doesn't process serverTimestamp correctly on return, but mostly internal.
            });
            added = true;
        }
        res.json({ success: true, added });
    } catch (error) {
        console.error("Error toggling favorite:", error);
        res.status(500).json({ error: "Failed to toggle favorite" });
    }
});


app.get('/', (req, res) => {
    res.send('Backend is running with API!');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    console.log("BACKEND V2 - PENDING EVENTS MODE");
});
