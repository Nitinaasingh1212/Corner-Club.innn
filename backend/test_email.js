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
    console.log("Simulating booking...");

    try {
        // 1. Get Events
        const events = await makeRequest('/api/events');

        if (!Array.isArray(events) || events.length === 0) {
            console.error("No events found! Cannot test booking.");
            return;
        }

        const validEvent = events[0];
        console.log(`Found event: ${validEvent.title}`);

        // 2. Book
        const bookingData = {
            eventId: validEvent.id,
            userId: "test-user-system",
            userDetails: {
                email: "nitinaaa121212@gmail.com",
                name: "Nitin Test",
                uid: "test-user-system"
            },
            quantity: 1
        };

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
