const http = require('http');

const data = JSON.stringify({
    username: 'cal_test_' + Date.now(),
    email: 'cal_' + Date.now() + '@example.com',
    password: 'password123',
    metrics: {
        goal: 'Lose Weight',
        gender: 'Male',
        dob: '1990-01-01',
        activityLevel: 'Active', // 1.55 multiplier
        height: 180,
        weight: 80, // BMR approx (10*80 + 6.25*180 - 5*34 + 5) = 800 + 1125 - 170 + 5 = 1760
        // TDEE = 1760 * 1.55 = 2728
        goalWeight: 75,
        weeklyGoal: 'Lose 0.5 kg per week' // -500
        // Expected ~ 2228
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
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Response Body:', body);
        try {
            const json = JSON.parse(body);
            console.log('User Metrics:', json.user.metrics);
            if (json.user.metrics.dailyCalories > 2000 && json.user.metrics.dailyCalories < 2500) {
                console.log('SUCCESS: Daily Calorie Calculation is within expected range.');
            } else {
                console.log('FAILURE: Daily Calories out of range or missing.');
            }
        } catch (e) {
            console.error('Error:', e.message);
        }
    });
});

req.on('error', (e) => console.error(`Problem: ${e.message}`));
req.write(data);
req.end();
