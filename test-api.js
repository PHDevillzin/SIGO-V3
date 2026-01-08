
import http from 'node:http';

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    const headers = JSON.stringify(res.headers);
    console.log(`HEADERS: ${headers}`);

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('BODY:', data.substring(0, 500) + (data.length > 500 ? '...' : ''));
        try {
            JSON.parse(data);
            console.log('Valid JSON received.');
        } catch (e) {
            console.log('Invalid JSON.');
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
