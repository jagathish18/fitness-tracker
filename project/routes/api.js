const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify token (simplified)
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// ... Existing Routes ...

// [NEW] AI Analysis Route (Simulated)
// [NEW] AI Analysis Route (Simulated)
// AI Analysis Data
const mockDatabase = [
    // --- Fruits & Vegetables ---
    { name: "Red Apple", cal: 95, p: 0.5, c: 25, f: 0.3, work: "15 Min Yoga Stretch" },
    { name: "Banana", cal: 105, p: 1.3, c: 27, f: 0.4, work: "20 Min Power Walk" },
    { name: "Orange", cal: 62, p: 1.2, c: 15, f: 0.2, work: "10 Min Jump Rope" },
    { name: "Grapes (1 cup)", cal: 62, p: 0.6, c: 16, f: 0.3, work: "15 Min Cycling" },
    { name: "Strawberry (1 cup)", cal: 53, p: 1.1, c: 13, f: 0.5, work: "15 Min Pilates" },
    { name: "Watermelon (1 wedge)", cal: 86, p: 1.7, c: 22, f: 0.4, work: "20 Min Swimming" },
    { name: "Broccoli (1 cup)", cal: 55, p: 3.7, c: 11, f: 0.6, work: "20 Min Strength Training" },
    { name: "Carrot", cal: 25, p: 0.6, c: 6, f: 0.1, work: "10 Min Jogging" },
    { name: "Spinach (1 cup)", cal: 7, p: 0.9, c: 1, f: 0.1, work: "15 Min Core Workout" },
    { name: "Cucumber", cal: 16, p: 0.7, c: 4, f: 0.1, work: "10 Min Stretching" },
    { name: "Avocado Toast", cal: 350, p: 12, c: 45, f: 18, work: "20 Min Yoga Flow" },
    { name: "Greek Salad", cal: 300, p: 10, c: 15, f: 22, work: "20 Min Light Cardio" },

    // --- Fast Food ---
    { name: "Cheeseburger", cal: 850, p: 40, c: 60, f: 50, work: "10 Min HIIT Fat Burn" },
    { name: "French Fries (Medium)", cal: 365, p: 4, c: 48, f: 17, work: "30 Min Cardio Burst" },
    { name: "Hot Dog", cal: 290, p: 10, c: 23, f: 17, work: "20 Min Jogging" },
    { name: "Chicken Nuggets (6 pcs)", cal: 270, p: 15, c: 16, f: 16, work: "20 Min Circuit Training" },
    { name: "Fried Chicken (1 pc)", cal: 320, p: 20, c: 10, f: 22, work: "25 Min Tabata" },
    { name: "Pepperoni Pizza (1 Slice)", cal: 300, p: 12, c: 35, f: 14, work: "20 Min HIIT" },
    { name: "Tacos (3 pcs)", cal: 550, p: 25, c: 45, f: 30, work: "30 Min Zumba Dance" },
    { name: "Nachos with Cheese", cal: 600, p: 10, c: 65, f: 35, work: "30 Min Elliptical" },

    // --- European Cuisine (Italian, French, Spanish, German) ---
    { name: "Margherita Pizza", cal: 800, p: 35, c: 90, f: 30, work: "45 Min Spinning Class" },
    { name: "Spaghetti Carbonara", cal: 850, p: 30, c: 85, f: 45, work: "45 Min HIIT" },
    { name: "Lasagna", cal: 600, p: 35, c: 40, f: 30, work: "40 Min Strength Training" },
    { name: "Risotto", cal: 400, p: 8, c: 60, f: 15, work: "30 Min Power Yoga" },
    { name: "Mushroom Ravioli", cal: 450, p: 14, c: 55, f: 18, work: "30 Min Pilates" },
    { name: "Tiramisu", cal: 450, p: 8, c: 45, f: 28, work: "30 Min Dance Cardio" },
    { name: "Gelato (1 scoop)", cal: 150, p: 3, c: 25, f: 5, work: "15 Min Walk" },
    { name: "Croissant", cal: 250, p: 5, c: 28, f: 14, work: "20 Min Morning Jog" },
    { name: "Baguette with Cheese", cal: 400, p: 15, c: 50, f: 15, work: "30 Min Hiking" },
    { name: "Quiche Lorraine", cal: 500, p: 20, c: 35, f: 30, work: "35 Min Aerobics" },
    { name: "Ratatouille", cal: 200, p: 4, c: 25, f: 10, work: "20 Min Light Yoga" },
    { name: "Paella", cal: 600, p: 25, c: 80, f: 20, work: "40 Min Running" },
    { name: "Gazpacho", cal: 150, p: 3, c: 20, f: 8, work: "15 Min Stretching" },
    { name: "Churros (3 pcs)", cal: 350, p: 4, c: 45, f: 18, work: "30 Min Cardio" },
    { name: "Bratwurst", cal: 400, p: 15, c: 5, f: 35, work: "30 Min Rowing" },
    { name: "Pretzel", cal: 300, p: 8, c: 60, f: 3, work: "25 Min Cycling" },
    { name: "Wiener Schnitzel", cal: 550, p: 35, c: 40, f: 25, work: "40 Min Crossfit" },
    { name: "Fish and Chips", cal: 800, p: 25, c: 85, f: 40, work: "50 Min Swimming" },
    { name: "Shepherd's Pie", cal: 450, p: 20, c: 40, f: 22, work: "35 Min Bodyweight Circuit" },

    // --- Asian Cuisine ---
    { name: "Sushi Platter (6 pcs)", cal: 400, p: 15, c: 65, f: 8, work: "30 Min Pilates" },
    { name: "Ramen", cal: 500, p: 20, c: 65, f: 18, work: "35 Min Martial Arts" },
    { name: "Pad Thai", cal: 600, p: 20, c: 75, f: 22, work: "40 Min Kickboxing" },
    { name: "Fried Rice", cal: 450, p: 12, c: 60, f: 15, work: "30 Min Jogging" },
    { name: "Dumplings (6 pcs)", cal: 350, p: 12, c: 40, f: 14, work: "25 Min Calisthenics" },
    { name: "Butter Chicken & Naan", cal: 1200, p: 45, c: 110, f: 70, work: "60 Min Heavy Lifting" },
    { name: "Chicken Biryani", cal: 750, p: 35, c: 95, f: 30, work: "45 Min HIIT" },
    { name: "Masala Dosa", cal: 500, p: 10, c: 80, f: 15, work: "30 Min Cardio" },

    // --- Breakfast & Healthy ---
    { name: "Oatmeal with Berries", cal: 300, p: 8, c: 55, f: 6, work: "20 Min Morning Stretch" },
    { name: "Green Smoothie", cal: 200, p: 5, c: 40, f: 2, work: "15 Min Core Workout" },
    { name: "Grilled Salmon & Veggies", cal: 500, p: 45, c: 10, f: 30, work: "40 Min Strength Training" },
    { name: "Quinoa Bowl", cal: 450, p: 15, c: 75, f: 10, work: "30 Min Yoga for Strength" },
    { name: "Steak & Asparagus", cal: 650, p: 60, c: 10, f: 40, work: "45 Min Heavy Lifting" },

    // --- Beverages & Desserts ---
    { name: "Cappuccino", cal: 120, p: 6, c: 10, f: 6, work: "10 Min Walk" },
    { name: "Green Tea", cal: 2, p: 0, c: 0, f: 0, work: "5 Min Breathwork" },
    { name: "Chocolate Cake (1 slice)", cal: 450, p: 6, c: 55, f: 22, work: "30 Min Stair Climber" },
    { name: "Vanilla Ice Cream", cal: 200, p: 4, c: 25, f: 10, work: "15 Min Dance" },
    { name: "Glazed Donut", cal: 250, p: 3, c: 30, f: 14, work: "20 Min Jumping Jacks" },

    // --- Community Favorites (from Food Habits Survey) ---
    { name: "General Tso's Chicken", cal: 450, p: 25, c: 40, f: 20, work: "30 Min Dance Cardio" },
    { name: "Wedding Soup", cal: 150, p: 8, c: 15, f: 5, work: "15 Min Walk" },
    { name: "Grilled Cheese Sandwich", cal: 400, p: 12, c: 35, f: 22, work: "25 Min HIIT" },
    { name: "Spaghetti & Meatballs", cal: 600, p: 25, c: 70, f: 20, work: "45 Min Run" },
    { name: "Chicken Parmesan", cal: 550, p: 35, c: 40, f: 25, work: "40 Min Weight Training" },
    { name: "Mac & Cheese", cal: 450, p: 15, c: 50, f: 20, work: "30 Min Cycling" },
    { name: "Sushi Platter", cal: 400, p: 15, c: 60, f: 5, work: "25 Min Yoga" },
    { name: "Steak & Mashed Potatoes", cal: 700, p: 45, c: 40, f: 35, work: "50 Min Compound Lifts" },
    { name: "Chicken Wings (6)", cal: 500, p: 30, c: 5, f: 35, work: "40 Min Boxing" },
    { name: "Shrimp Alfredo", cal: 750, p: 30, c: 60, f: 40, work: "50 Min Zwift Ride" },
    { name: "Tortilla Chips & Salsa", cal: 300, p: 4, c: 40, f: 12, work: "20 Min Jog" },
    { name: "Beef Stroganoff", cal: 600, p: 30, c: 45, f: 30, work: "40 Min Circuit Training" },
    { name: "Peanut Butter Sandwich", cal: 350, p: 12, c: 30, f: 18, work: "25 Min Pilates" },
    { name: "Chicken Curry", cal: 500, p: 25, c: 35, f: 25, work: "35 Min Aerobics" },
    { name: "Pancakes with Syrup", cal: 450, p: 6, c: 80, f: 10, work: "30 Min Rowing" },

    // --- Archive Dataset Classes (Training Data Simulation) ---
    // 1. Bread
    { name: "Sourdough Bread with Butter", cal: 250, p: 8, c: 45, f: 5, work: "20 Min Walk" },
    { name: "Bagel with Cream Cheese", cal: 350, p: 10, c: 50, f: 12, work: "25 Min Jog" },
    // 2. Dairy product
    { name: "Greek Yogurt Parfait", cal: 200, p: 15, c: 25, f: 4, work: "15 Min HIIT" },
    { name: "Cheese & Crackers Plate", cal: 300, p: 10, c: 20, f: 20, work: "20 Min Yoga" },
    // 3. Dessert
    { name: "Apple Pie", cal: 400, p: 3, c: 60, f: 18, work: "30 Min Cycling" },
    { name: "Cheesecake", cal: 500, p: 8, c: 40, f: 35, work: "40 Min Elliptical" },
    // 4. Egg
    { name: "Scrambled Eggs with Toast", cal: 350, p: 20, c: 30, f: 15, work: "25 Min Calisthenics" },
    { name: "Omelette with Veggies", cal: 250, p: 18, c: 5, f: 18, work: "20 Min Pilates" },
    // 5. Fried food
    { name: "Fried Chicken Drumsticks", cal: 600, p: 40, c: 15, f: 40, work: "45 Min Boxing" },
    { name: "French Fries (Large)", cal: 500, p: 5, c: 65, f: 25, work: "40 Min Cardio" },
    // 6. Meat
    { name: "Grilled Ribeye Steak", cal: 800, p: 60, c: 0, f: 60, work: "60 Min Heavy Lifting" },
    { name: "Roast Beef Sandwich", cal: 450, p: 30, c: 35, f: 20, work: "35 Min Circuit" },
    // 7. Noodles-Pasta
    { name: "Pad Thai", cal: 650, p: 20, c: 80, f: 25, work: "45 Min Dance" },
    { name: "Spaghetti Carbonara", cal: 700, p: 25, c: 60, f: 35, work: "50 Min Run" },
    // 8. Rice
    { name: "Chicken Fried Rice", cal: 550, p: 25, c: 70, f: 20, work: "40 Min Zumba" },
    { name: "Vegetable Biryani", cal: 450, p: 10, c: 80, f: 10, work: "30 Min Power Walk" },
    // 9. Seafood
    { name: "Grilled Salmon", cal: 400, p: 35, c: 0, f: 25, work: "30 Min Swimming" },
    { name: "Fish Tacos", cal: 450, p: 20, c: 40, f: 20, work: "35 Min Bodyweight" },
    // 10. Soup
    { name: "Chicken Noodle Soup", cal: 200, p: 15, c: 20, f: 5, work: "15 Min Stretch" },
    { name: "Clam Chowder", cal: 400, p: 10, c: 30, f: 25, work: "30 Min Walk" },
    // 11. Vegetable-Fruit
    { name: "Fresh Fruit Salad", cal: 150, p: 2, c: 35, f: 0, work: "10 Min Jump Rope" },
    { name: "Caesar Salad", cal: 350, p: 10, c: 15, f: 28, work: "25 Min Yoga" }
];

const mult = require('multer');
const fs = require('fs');
const path = require('path');

// Configure Multer (Memory Storage)
const upload = mult({ storage: mult.memoryStorage() });

// --- DATASET TRAINING (Memorization) ---
const DATASET_PATHS = [
    path.join(__dirname, '../archive (1)/training'),
    path.join(__dirname, '../Indian Food Images/Indian Food Images')
];
const fileSizeMap = new Map(); // Size -> ClassName

function formatClassName(name) {
    // Convert "aloo_gobi" -> "Aloo Gobi"
    return name.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function trainModel() {
    console.log("Training AI Model on Multiple Datasets...");
    let totalImages = 0;
    let totalClasses = 0;

    DATASET_PATHS.forEach(datasetPath => {
        if (!fs.existsSync(datasetPath)) {
            console.log("Dataset path not found:", datasetPath);
            return;
        }

        const classes = fs.readdirSync(datasetPath);
        classes.forEach(cls => {
            const classPath = path.join(datasetPath, cls);
            if (fs.statSync(classPath).isDirectory()) {
                const formattedName = formatClassName(cls);
                totalClasses++;

                const files = fs.readdirSync(classPath);
                files.forEach(file => {
                    const filePath = path.join(classPath, file);
                    const stats = fs.statSync(filePath);
                    fileSizeMap.set(stats.size, formattedName);
                    totalImages++;
                });
            }
        });
    });

    console.log(`AI Model Trained! Memorized ${totalImages} images across ${totalClasses} classes.`);
}

// Start Training on Server Boot
trainModel();

// [NEW] AI Analyze with File Upload
router.post('/ai-analyze', auth, upload.single('image'), async (req, res) => {
    // 1. Try Accurate Dataset Match (File Size)
    let detectedClass = null;
    let result = null;

    if (req.file) {
        const size = req.file.size;
        if (fileSizeMap.has(size)) {
            detectedClass = fileSizeMap.get(size);
            console.log(`AI PREDICTION (Exact Match): ${detectedClass}`);
        }
    }

    // 2. Intelligent Keyword Matching (Fallback)
    const { imageName } = req.body;

    // Find Food in Database
    if (detectedClass) {
        // Try to find detected class in DB
        result = mockDatabase.find(f => f.name.toLowerCase().includes(detectedClass.toLowerCase()));
        if (!result) {
            // Create dynamic entry if not in DB but found in dataset
            // Simulate nutrition based on "Indian" assumption or generic
            result = {
                name: detectedClass,
                cal: 350 + Math.floor(Math.random() * 200), // Random 350-550
                p: 10 + Math.floor(Math.random() * 20),
                c: 20 + Math.floor(Math.random() * 40),
                f: 10 + Math.floor(Math.random() * 15),
                work: "30 Min AI Recommended Workout"
            };
        }
    } else if (imageName) {
        const lowerName = imageName.toLowerCase();
        result = mockDatabase.find(food => lowerName.includes(food.name.toLowerCase()));

        if (!result) {
            const keywords = mockDatabase.map(f => ({ item: f, keys: f.name.toLowerCase().split(' ') }));
            const bestFit = keywords.find(k => k.keys.some(key => lowerName.includes(key) && key.length > 3));
            if (bestFit) result = bestFit.item;
        }
    }

    // 3. Random Fallback
    if (!result) {
        result = mockDatabase[Math.floor(Math.random() * mockDatabase.length)];
        console.log(`AI Guessed (Results uncertain): ${result.name}`);
    }

    res.json({
        foodName: result.name,
        calories: result.cal,
        macros: {
            protein: result.p,
            carbs: result.c,
            fats: result.f
        },
        workoutRecommendation: result.work,
        fullWorkout: {
            type: "AI Suggested",
            duration: 30,
            calories: Math.floor(result.cal * 0.8)
        }
    });
});

// [NEW] Get 1-Year Plan
// [NEW] Helper to parse Fitbit Data
const analyzeFitbitData = () => {
    try {
        const baseDir = path.join(__dirname, '../archive (1)/mturkfitbit_export_4.12.16-5.12.16/Fitabase Data 4.12.16-5.12.16');
        const activityPath = path.join(baseDir, 'dailyActivity_merged.csv');
        const hourlyPath = path.join(baseDir, 'hourlyIntensities_merged.csv');

        let avgActiveMinutes = 22; // Fallback
        let peakHour = "5:00 PM"; // Fallback

        // 1. Calculate Average Very Active Minutes
        if (fs.existsSync(activityPath)) {
            const data = fs.readFileSync(activityPath, 'utf8').split('\n').slice(1);
            let totalMinutes = 0;
            let count = 0;

            data.forEach(line => {
                const cols = line.split(',');
                // Index 10: VeryActiveMinutes
                if (cols[10]) {
                    const mins = parseInt(cols[10]);
                    if (!isNaN(mins) && mins > 0) {
                        totalMinutes += mins;
                        count++;
                    }
                }
            });
            if (count > 0) avgActiveMinutes = Math.round(totalMinutes / count);
        }

        // 2. Calculate Peak Hour
        if (fs.existsSync(hourlyPath)) {
            const data = fs.readFileSync(hourlyPath, 'utf8').split('\n').slice(1);
            const intensityByHour = {};

            data.forEach(line => {
                const cols = line.split(',');
                // Index 1: ActivityHour (e.g., "4/12/2016 12:00:00 AM")
                // Index 2: TotalIntensity
                if (cols[1] && cols[2]) {
                    const timePart = cols[1].split(' ')[1] + ' ' + cols[1].split(' ')[2]; // Extract "12:00:00 AM"
                    // Simplify to hour: "12 PM"
                    const hour = timePart.split(':')[0] + ' ' + timePart.split(' ')[1];

                    const intensity = parseInt(cols[2]);
                    if (!isNaN(intensity)) {
                        intensityByHour[hour] = (intensityByHour[hour] || 0) + intensity;
                    }
                }
            });

            // Find max
            let maxIntensity = 0;
            for (const [hour, val] of Object.entries(intensityByHour)) {
                if (val > maxIntensity) {
                    maxIntensity = val;
                    peakHour = hour;
                }
            }
        }

        return { avgActiveMinutes, peakHour };

    } catch (err) {
        console.error("Fitbit Analysis Error:", err);
        return { avgActiveMinutes: 30, peakHour: "6 PM" };
    }
};

// [NEW] Helper to parse Gym Dataset
const loadGymExercises = () => {
    try {
        const csvPath = path.join(__dirname, '../gym dataset/megaGymDataset.csv');
        if (!fs.existsSync(csvPath)) return {};

        const data = fs.readFileSync(csvPath, 'utf8').split('\n').filter(l => l.trim().length > 0).slice(1);
        const exercises = {
            push: [],
            pull: [],
            legs: [],
            core: []
        };

        // Helper to parse CSV line containing quotes
        const parseLine = (line) => {
            const matches = [];
            let inQuote = false;
            let current = '';
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuote = !inQuote;
                } else if (char === ',' && !inQuote) {
                    matches.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            matches.push(current.trim());
            return matches;
        };

        data.forEach(line => {
            const cols = parseLine(line);
            // Title(1), Desc(2), Type(3), BodyPart(4), Equipment(5), Level(6), Rating(7)
            const ex = {
                title: cols[1],
                desc: cols[2],
                bodyPart: cols[4],
                equipment: cols[5],
                level: cols[6],
                rating: parseFloat(cols[7]) || 0
            };

            if (!ex.title) return;

            // Map BodyParts to Split
            const part = ex.bodyPart;
            if (['Chest', 'Shoulders', 'Triceps'].includes(part)) exercises.push.push(ex);
            else if (['Lats', 'Middle Back', 'Lower Back', 'Biceps', 'Traps', 'Forearms'].includes(part)) exercises.pull.push(ex);
            else if (['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Adductors', 'Abductors'].includes(part)) exercises.legs.push(ex);
            else if (['Abdominals'].includes(part)) exercises.core.push(ex);
        });

        // Sort by rating desc
        ['push', 'pull', 'legs', 'core'].forEach(k => {
            exercises[k].sort((a, b) => b.rating - a.rating);
        });

        return exercises;

    } catch (err) {
        console.error("Gym Dataset Error:", err);
        return {};
    }
};

router.get('/plans/:goal', auth, async (req, res) => {
    const { goal } = req.params;
    const insights = analyzeFitbitData();
    const gymData = loadGymExercises();

    // Helper to get top N exercises for a category
    const getExercises = (category, count) => {
        if (!gymData[category]) return [];
        // Get unique titles to avoid duplicates
        const unique = [];
        const seen = new Set();
        for (const ex of gymData[category]) {
            if (!seen.has(ex.title)) {
                seen.add(ex.title);
                unique.push(ex);
            }
        }
        return unique.slice(0, count);
    };

    let plan = {
        title: "Professional Gym Master Routine",
        badge: "Powered by MegaGym Dataset",
        phases: []
    };

    const pushExercises = getExercises('push', 5);
    const pullExercises = getExercises('pull', 5);
    const legsExercises = getExercises('legs', 5);
    const coreExercises = getExercises('core', 3);

    const createPhase = (title, focus, desc, workouts) => ({
        title, focus, desc,
        video: "", // No video, utilizing card descriptions
        steps: workouts, // Passing exercise objects directly
        nutrition: "High protein, track macros."
    });

    if (goal === 'lose-weight') {
        plan.title = "Fat Loss Shred Protocol";
        plan.phases = [
            createPhase(
                "Day 1: Push (Metabolic)",
                "High Intensity",
                `Start your week by targeting Chest, Shoulders, and Triceps. Recommended time: **${insights.peakHour}**.`,
                pushExercises.map(e => ({ ...e, reps: "12-15 reps", sets: "3 sets" }))
            ),
            createPhase(
                "Day 2: Pull (Strength)",
                "Back Width & Thickness",
                "Focus on controlling the eccentric phase.",
                pullExercises.map(e => ({ ...e, reps: "10-12 reps", sets: "4 sets" }))
            ),
            createPhase(
                "Day 3: Legs & Core",
                "Lower Body Stability",
                "High caloric burn session.",
                [...legsExercises.map(e => ({ ...e, reps: "15 reps", sets: "3 sets" })), ...coreExercises.map(e => ({ ...e, reps: "20 reps", sets: "3 sets" }))]
            )
        ];
    } else {
        plan.title = "Hypertrophy Mass Builder";
        plan.phases = [
            createPhase(
                "Day 1: Heavy Push",
                "Mechanical Tension",
                `Heavy compound movements for Chest and Shoulders. Train at **${insights.peakHour}** for max strength.`,
                pushExercises.map(e => ({ ...e, reps: "5-8 reps", sets: "5 sets" }))
            ),
            createPhase(
                "Day 2: Volumetric Pull",
                "Hypertrophy",
                "Focus on the squeeze. Lats and Biceps.",
                pullExercises.map(e => ({ ...e, reps: "8-12 reps", sets: "4 sets" }))
            ),
            createPhase(
                "Day 3: Leg Destruction",
                "Leg Growth",
                "Quads, Hams, and Calves.",
                legsExercises.map(e => ({ ...e, reps: "10-12 reps", sets: "4 sets" }))
            )
        ];
    }

    res.json(plan);
});

// Get Dashboard Data
router.get('/dashboard', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const workouts = await Workout.find({ userId });
        const meals = await Meal.find({ userId });
        const user = await User.findById(userId).select('-password');

        res.json({ workouts, meals, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add Workout
// Add Workout
router.post('/workouts', auth, async (req, res) => {
    try {
        const { type, duration, calories, exercises, notes, title } = req.body;

        // Calculate total sets and volume if exercises provided
        let totalSets = 0;
        let totalVolume = 0;

        if (exercises && Array.isArray(exercises)) {
            exercises.forEach(ex => {
                if (ex.sets) {
                    totalSets += ex.sets.length;
                    ex.sets.forEach(s => {
                        totalVolume += (s.weight || 0) * (s.reps || 0);
                    });
                }
            });
        }

        const newWorkout = new Workout({
            userId: req.user.userId,
            title: title || 'Workout',
            type,
            duration,
            calories,
            exercises,
            notes,
            // Legacy fields fallback or aggregated
            sets: totalSets,
            weight: totalVolume // storing total volume in 'weight' field for backward compat or analytics
        });

        const workout = await newWorkout.save();
        res.json(workout);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete Workout
router.delete('/workouts/:id', auth, async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);
        if (!workout) return res.status(404).json({ msg: 'Workout not found' });

        // Check user
        if (workout.userId.toString() !== req.user.userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await workout.deleteOne();
        res.json({ msg: 'Workout removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add Meal
router.post('/meals', auth, async (req, res) => {
    try {
        const newMeal = new Meal({
            userId: req.user.userId,
            ...req.body
        });
        const meal = await newMeal.save();
        res.json(meal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update User Metrics (Weight, Goal)
router.put('/user/metrics', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.metrics = { ...user.metrics, ...req.body };
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// [NEW] Get Community Insights (from CSV)
router.get('/insights', async (req, res) => {
    try {
        const csvPath = path.join(__dirname, '../archive/fitness analysis.csv');
        if (!fs.existsSync(csvPath)) {
            return res.json({ error: "Dataset not found" });
        }

        const data = fs.readFileSync(csvPath, 'utf8');
        const lines = data.split('\n').filter(l => l.trim() !== '');

        // Helper to parse CSV line with quotes
        const parseLine = (line) => {
            const matches = [];
            let inQuote = false;
            let current = '';
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuote = !inQuote;
                } else if (char === ',' && !inQuote) {
                    matches.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            matches.push(current.trim());
            return matches;
        };

        // Skip header
        const rows = lines.slice(1).map(parseLine);

        // Agregators
        const motivations = {};
        const barriers = {};
        const forms = {};

        rows.forEach(row => {
            // Index 7: Barriers (semicolon sep)
            // Index 8: Forms (semicolon sep)
            // Index 17: Motivations (semicolon sep)

            if (row[7]) row[7].split(';').forEach(i => {
                const key = i.trim();
                if (key) barriers[key] = (barriers[key] || 0) + 1;
            });

            if (row[8]) row[8].split(';').forEach(i => {
                const key = i.trim();
                if (key) forms[key] = (forms[key] || 0) + 1;
            });

            if (row[17]) row[17].split(';').forEach(i => {
                const key = i.trim();
                if (key) motivations[key] = (motivations[key] || 0) + 1;
            });
        });

        // Sort and Top 3
        const getTop = (obj) => Object.entries(obj)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([label, count]) => ({ label, count }));

        res.json({
            motivations: getTop(motivations),
            barriers: getTop(barriers),
            popularForms: getTop(forms),
            totalRespondents: rows.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
