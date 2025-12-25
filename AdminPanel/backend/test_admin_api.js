const fetch = require('node-fetch'); // If not available, use http/https
// Actually node 18+ has fetch built-in. user environment?
// Let's assume fetch works or use http.
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/events/pending',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('BODY:', data);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
