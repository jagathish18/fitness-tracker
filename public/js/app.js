const API_URL = '/api';

// Authentication
async function login(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.token) {
            localStorage.setItem('token', data.token);
            if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            alert(data.msg || 'Login failed. Please check your email and password.');
        }
    } catch (err) {
        console.error(err);
        alert('Server error during login.');
    }
}

async function register(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    const weightEl = document.getElementById('regWeight');
    const heightEl = document.getElementById('regHeight');
    const weight = weightEl ? (parseFloat(weightEl.value) || 70) : 70;
    const height = heightEl ? (parseFloat(heightEl.value) || 170) : 170;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, metrics: { weight, height } })
        });
        const data = await res.json();
        if (res.ok && data.token) {
            localStorage.setItem('token', data.token);
            if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
            alert('Registration successful! Redirecting to dashboard...');
            window.location.href = 'dashboard.html';
        } else {
            alert(data.msg || 'Registration failed.');
        }
    } catch (err) {
        console.error(err);
        alert('Server error during registration.');
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Attach Event Listeners for Auth
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', login);
    document.getElementById('registerForm').addEventListener('submit', register);
}

// Dashboard Logic
async function loadDashboard() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/dashboard`, {
            headers: { 'x-auth-token': token }
        });
        const data = await res.json();

        // 1. Header Info
        const user = data.user;
        if (document.getElementById('welcomeMsg')) {
            document.getElementById('welcomeMsg').innerHTML = `Hello, <span class="text-gradient">${user.username}</span>`;
            document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        }

        // 2. Calculate Daily Totals
        const today = new Date().toDateString();
        let dailyCalories = 0;
        let dailyDuration = 0;

        // Filter today's workouts
        const todayWorkouts = data.workouts.filter(w => new Date(w.date).toDateString() === today);
        todayWorkouts.forEach(w => {
            dailyCalories += w.calories || 0;
            dailyDuration += w.duration || 0;
        });

        // Filter today's meals
        const todayMeals = data.meals.filter(m => new Date(m.date).toDateString() === today);
        todayMeals.forEach(m => {
            // dailyCalories is usually "burned", but if we want net, we'd subtract. 
            // For now, let's keep "Daily Activity" as Burned + Duration.
        });

        // Update Hero Stats
        const targetCalories = (user.metrics && user.metrics.dailyCalories) ? user.metrics.dailyCalories : 2000;

        if (document.getElementById('caloriesBurned')) {
            document.getElementById('caloriesBurned').innerText = dailyCalories;

            // Update Target Display
            if (document.getElementById('calorieTarget')) {
                document.getElementById('calorieTarget').innerText = `/ ${targetCalories} kcal`;
            }

            // Progress Bar
            const progress = Math.min((dailyCalories / targetCalories) * 100, 100);
            document.getElementById('calProgress').style.width = `${progress}%`;
        }

        if (document.getElementById('onboardingCalorieGoalText')) {
            document.getElementById('onboardingCalorieGoalText').innerText = `${targetCalories.toLocaleString()} kcal/day`;
        }

        if (document.getElementById('onboardingMetricsSummary') && user.metrics) {
            const m = user.metrics;
            const parts = [];
            if (m.goal) parts.push(m.goal);
            if (m.weeklyGoal) parts.push(m.weeklyGoal);
            if (m.activityLevel) parts.push(m.activityLevel);
            if (m.weight) parts.push(`${m.weight}kg`);
            
            const summaryStr = parts.length > 0 ? parts.join(' • ') : 'Based on onboarding inputs';
            document.getElementById('onboardingMetricsSummary').innerText = summaryStr;
        }

        if (document.getElementById('workoutDuration')) {
            document.getElementById('workoutDuration').innerText = dailyDuration;
        }

        // 3. Recent Activity Feed (Mix Workouts + Meals)
        const feedList = document.getElementById('recentActivityList');
        if (feedList) {
            feedList.innerHTML = '';

            // Combine and Sort
            const activity = [
                ...data.workouts.map(w => ({ ...w, type: 'workout', date: new Date(w.date) })),
                ...data.meals.map(m => ({ ...m, type: 'meal', date: new Date(m.date) }))
            ].sort((a, b) => b.date - a.date).slice(0, 3); // Top 3

            if (activity.length === 0) {
                feedList.innerHTML = '<p style="color: var(--text-muted)">No recent activity.</p>';
            } else {
                activity.forEach(item => {
                    const el = document.createElement('div');
                    el.style.display = 'flex';
                    el.style.alignItems = 'center';
                    el.style.padding = '12px 0';
                    el.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

                    const isWorkout = item.type === 'workout';
                    const icon = isWorkout ? '🏋️' : '🥗';
                    const title = isWorkout ? (item.title || 'Workout') : item.name;
                    const subtitle = isWorkout ? `${item.duration} min • ${item.calories} cal` : `${item.calories} cal • ${item.protein || 0}g protein`;

                    el.innerHTML = `
                        <div style="font-size: 1.5rem; margin-right: 15px; background: rgba(255,255,255,0.05); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${icon}</div>
                        <div>
                            <h4 style="margin: 0; font-size: 1rem; color: var(--text-main);">${title}</h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">${subtitle}</p>
                        </div>
                        <div style="margin-left: auto; font-size: 0.8rem; color: #555;">
                            ${item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    `;
                    feedList.appendChild(el);
                });
            }
        }

        // 4. Weekly Volume Chart
        renderWeeklyChart(data.workouts);

    } catch (err) {
        console.error(err);
    }
}

function renderWeeklyChart(workouts) {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;

    // Last 7 Days Logic
    const labels = [];
    const dataPoints = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

        const dateStr = d.toDateString();
        const dayVol = workouts
            .filter(w => new Date(w.date).toDateString() === dateStr)
            .reduce((acc, w) => acc + (w.duration || 0), 0);

        dataPoints.push(dayVol);
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Minutes',
                data: dataPoints,
                backgroundColor: '#00E676',
                borderRadius: 4,
                barThickness: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
                x: { grid: { display: false }, ticks: { color: '#666' } }
            }
        }
    });
}

// --- New Professional Tracker Logic ---

// Modal Controls
function openWorkoutModal() {
    document.getElementById('workoutModal').style.display = 'block';
    // Clear previous data
    document.getElementById('exerciseList').innerHTML = '';
    addExerciseField(); // Start with one empty exercise
}

function closeWorkoutModal() {
    document.getElementById('workoutModal').style.display = 'none';
}

// Dynamic Form Building
function addExerciseField() {
    const list = document.getElementById('exerciseList');
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-block';
    exerciseDiv.style.marginBottom = '20px';
    exerciseDiv.style.padding = '15px';
    exerciseDiv.style.background = '#222';
    exerciseDiv.style.borderRadius = '8px';

    exerciseDiv.innerHTML = `
        <input type="text" class="ex-name" placeholder="Exercise Name (e.g., Bench Press)" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #333; color: white; border: none; border-radius: 4px;">
        <div class="sets-container"></div>
        <button onclick="addSetField(this)" style="background: #444; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-top: 5px; font-size: 12px;">+ Add Set</button>
        <button onclick="this.parentElement.remove()" style="background: #ff5252; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-top: 5px; font-size: 12px; float: right;">Remove Exercise</button>
    `;

    list.appendChild(exerciseDiv);
    // Add first set automatically
    addSetField(exerciseDiv.querySelector('button'));
}

function addSetField(btn) {
    const container = btn.previousElementSibling;
    const setDiv = document.createElement('div');
    setDiv.style.display = 'flex';
    setDiv.style.gap = '10px';
    setDiv.style.marginBottom = '5px';

    setDiv.innerHTML = `
        <input type="number" class="set-weight" placeholder="kg" style="width: 70px; padding: 5px; background: #333; color: white; border: none; border-radius: 4px;">
        <input type="number" class="set-reps" placeholder="reps" style="width: 70px; padding: 5px; background: #333; color: white; border: none; border-radius: 4px;">
        <button onclick="this.parentElement.remove()" style="background: none; color: #777; border: none; cursor: pointer;">&times;</button>
    `;
    container.appendChild(setDiv);
}

// Save Workout
async function saveWorkout() {
    const title = document.getElementById('workoutTitle').value || 'Workout';
    const duration = document.getElementById('workoutDuration').value || 0;
    const calories = document.getElementById('workoutCalories').value || 0;

    const exercises = [];
    document.querySelectorAll('.exercise-block').forEach(block => {
        const name = block.querySelector('.ex-name').value;
        if (!name) return;

        const sets = [];
        block.querySelectorAll('.sets-container > div').forEach(setRow => {
            const weight = setRow.querySelector('.set-weight').value || 0;
            const reps = setRow.querySelector('.set-reps').value || 0;
            sets.push({ weight: Number(weight), reps: Number(reps) });
        });

        if (sets.length > 0) exercises.push({ name, sets });
    });

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/workouts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                title,
                type: 'Strength', // Defaulting to Strength for now
                duration: Number(duration),
                calories: Number(calories),
                exercises
            })
        });

        if (res.ok) {
            alert('Workout Logged!');
            closeWorkoutModal();
            loadWorkoutHistory(); // Refresh feed
        } else {
            alert('Error logging workout');
        }
    } catch (err) {
        console.error(err);
    }
}

// Load Workout History (Feed)
async function loadWorkoutHistory() {
    const feed = document.getElementById('workoutFeed');
    if (!feed) return; // Not on tracker page

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/dashboard`, { // Reusing dashboard endpoint for now as it returns workouts
            headers: { 'x-auth-token': token }
        });
        const data = await res.json();

        feed.innerHTML = '';
        if (data.workouts.length === 0) {
            feed.innerHTML = '<p style="color: var(--text-muted)">No workouts yet. Start one!</p>';
            return;
        }

        // Sort by date desc
        const sortedWorkouts = data.workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedWorkouts.forEach(w => {
            const date = new Date(w.date).toLocaleDateString();
            const volume = w.weight || 0; // Legacy or Aggregated Volume

            let exercisesHtml = '';
            if (w.exercises && w.exercises.length > 0) {
                exercisesHtml = '<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #333;">';
                w.exercises.forEach(ex => {
                    const bestSet = ex.sets.reduce((max, s) => s.weight > max ? s.weight : max, 0);
                    exercisesHtml += `
                        <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
                            <span style="color: #ddd;">${ex.sets.length} x ${ex.name}</span>
                            <span style="color: var(--text-muted)">Best: ${bestSet}kg</span>
                        </div>
                    `;
                });
                exercisesHtml += '</div>';
            } else {
                // Legacy fallback
                exercisesHtml = `<p style="color: var(--text-muted); font-size: 14px;">Single Set: ${w.weight}kg x ${w.reps} reps</p>`;
            }

            const card = document.createElement('div');
            card.className = 'chart-container'; // Reuse card style
            card.style.marginBottom = '15px';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="margin: 0; color: var(--primary);">${w.title || w.type || 'Workout'}</h3>
                        <p style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">${date} • ${w.duration} min</p>
                    </div>
                     <div style="text-align: right;">
                        <span style="display: block; font-size: 18px; font-weight: bold;">${volume} <span style="font-size: 12px; color: var(--text-muted)">kg Vol</span></span>
                     </div>
                </div>
                ${exercisesHtml}
            `;
            feed.appendChild(card);
        });

    } catch (err) {
        console.error(err);
    }
}

// Auto-load if on tracker page
if (window.location.pathname.endsWith('tracker.html')) {
    loadWorkoutHistory();
}

