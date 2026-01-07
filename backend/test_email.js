const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function testBooking() {
    console.log("Simulating booking process...");

    try {
        // 1. Create a dummy event to ensure capacity
        const newEvent = {
            title: "Test Event For Email " + Date.now(),
            date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            time: "10:00 AM",
            location: "Test Location",
            city: "Test City",
            price: 100,
            capacity: 10, // Ensure capacity
            description: "This is a test event",
            creatorId: "test-admin",
            category: "Music",
            organizer: "Test Organizer",
            phone: "1234567890"
        };

        console.log("Creating test event...");
        const createResult = await makeRequest('/api/events', 'POST', newEvent);
        
        if (!createResult.success) {
            console.error("Failed to create event:", createResult);
            return;
        }

        const eventId = createResult.id;
        console.log(`Created event with ID: ${eventId}`);

        // 2. Approve the event (admin flow) - wait, standard flow creates as pending.
        // We need to approve it so it's bookable? 
        // Actually, the booking logic in server.js (line 252) fetches from "events" collection.
        // Pending events are in "pending_events".
        // Use the admin approve endpoint.
        
        console.log("Approving event...");
        await makeRequest(`/api/admin/events/${eventId}/approve`, 'POST');

        // 3. Book the event
        const bookingData = {
            eventId: eventId,
            userId: "test-user-system",
            userDetails: {
                email: "nitinaaa121212@gmail.com",
                name: "Nitin Test",
                uid: "test-user-system",
                phone: "9876543210"
            },
            quantity: 1
        };

        console.log("Booking event...");
        const result = await makeRequest('/api/bookings', 'POST', bookingData);
        console.log("Booking Response:", result);

        if (result.success) {
            console.log("✅ Booking successful! Email trigger should have fired.");
        } else {
            console.error("❌ Booking failed:", result);
        }

    } catch (err) {
        console.error("Test failed:", err);
    }
}

testBooking();
