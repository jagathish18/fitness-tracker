const http = require('http');

const data = JSON.stringify({
    username: 'testuser_' + Date.now(),
    email: 'test_' + Date.now() + '@example.com',
    password: 'password123',
    metrics: {
        goal: 'Lose Weight',
        gender: 'Male',
        dob: '1990-01-01',
        activityLevel: 'Active',
        height: 180,
        weight: 80,
        goalWeight: 75,
        weeklyGoal: 'Lose 0.5 kg per week'
    },
    location: {
        country: 'TestLand',
        zip: '12345'
    }
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log('BODY:', body);
        try {
            const json = JSON.parse(body);
            if (json.user && json.user.metrics.gender === 'Male') {
                console.log('SUCCESS: Extended fields saved correctly.');
            } else {
                console.log('FAILURE: Fields missing or incorrect.');
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
