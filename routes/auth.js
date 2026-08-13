const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register User
router.post('/register', async (req, res) => {
    const { username, email, password, metrics, location } = req.body;
    try {
        if (!email || !password || !username) {
            return res.status(400).json({ msg: 'Please enter all required fields (username, email, password)' });
        }

        const cleanEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: cleanEmail });
        if (user) return res.status(400).json({ msg: 'User already exists with this email' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Safe metrics parsing
        const safeMetrics = metrics || {};
        let bmr = 0;
        const weight = parseFloat(safeMetrics.weight) || 70;
        const height = parseFloat(safeMetrics.height) || 170;
        const age = safeMetrics.dob ? (new Date().getFullYear() - new Date(safeMetrics.dob).getFullYear()) : 25;

        if (safeMetrics.gender === 'Female') {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        }

        let activityMultiplier = 1.2;
        switch (safeMetrics.activityLevel) {
            case 'Lightly Active': activityMultiplier = 1.375; break;
            case 'Active': activityMultiplier = 1.55; break;
            case 'Very Active': activityMultiplier = 1.725; break;
            default: activityMultiplier = 1.2;
        }

        let tdee = bmr * activityMultiplier;

        // Adjust for Goal
        if (safeMetrics.weeklyGoal) {
            if (safeMetrics.weeklyGoal.includes('Lose 0.25')) tdee -= 250;
            else if (safeMetrics.weeklyGoal.includes('Lose 0.5')) tdee -= 500;
            else if (safeMetrics.weeklyGoal.includes('Lose 1')) tdee -= 1000;
            else if (safeMetrics.weeklyGoal.includes('Gain 0.25')) tdee += 250;
            else if (safeMetrics.weeklyGoal.includes('Gain 0.5')) tdee += 500;
        }

        const calculatedMetrics = {
            ...safeMetrics,
            dailyCalories: Math.round(tdee)
        };

        user = new User({
            username: username.trim(),
            email: cleanEmail,
            password: hashedPassword,
            metrics: calculatedMetrics,
            location: location || {},
            dietaryPreferences: req.body.dietaryPreferences || [],
            obstacles: req.body.obstacles || []
        });

        await user.save();
        console.log(`[AUTH] User registered and saved to database: ${cleanEmail}`);

        const payload = { userId: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, username: user.username, email: user.email, metrics: user.metrics } });
    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter both email and password' });
        }

        const cleanEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: cleanEmail });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials. User not found.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials. Password mismatch.' });

        const payload = { userId: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        console.log(`[AUTH] User logged in successfully: ${cleanEmail}`);
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, metrics: user.metrics } });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
});

// Google Auth Removed

module.exports = router;
