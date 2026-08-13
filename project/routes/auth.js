const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register User
router.post('/register', async (req, res) => {
    const { username, email, password, metrics, location } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Calculate Daily Calories
        let bmr = 0;
        const weight = metrics.weight || 70;
        const height = metrics.height || 170;
        const age = metrics.dob ? (new Date().getFullYear() - new Date(metrics.dob).getFullYear()) : 25;

        if (metrics.gender === 'Female') {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        }

        let activityMultiplier = 1.2;
        switch (metrics.activityLevel) {
            case 'Lightly Active': activityMultiplier = 1.375; break;
            case 'Active': activityMultiplier = 1.55; break;
            case 'Very Active': activityMultiplier = 1.725; break;
            default: activityMultiplier = 1.2;
        }

        let tdee = bmr * activityMultiplier;

        // Adjust for Goal
        if (metrics.weeklyGoal) {
            if (metrics.weeklyGoal.includes('Lose 0.25')) tdee -= 250;
            else if (metrics.weeklyGoal.includes('Lose 0.5')) tdee -= 500;
            else if (metrics.weeklyGoal.includes('Lose 1')) tdee -= 1000;
            else if (metrics.weeklyGoal.includes('Gain 0.25')) tdee += 250;
            else if (metrics.weeklyGoal.includes('Gain 0.5')) tdee += 500;
        }

        const calculatedMetrics = {
            ...metrics,
            dailyCalories: Math.round(tdee)
        };

        user = new User({
            username,
            email,
            password: hashedPassword,
            metrics: calculatedMetrics,
            location,
            dietaryPreferences: req.body.dietaryPreferences || [],
            obstacles: req.body.obstacles || []
        });

        await user.save();

        const payload = { userId: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

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
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { userId: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.id, username: user.username, email: user.email, metrics: user.metrics } });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
});

// Google Auth Removed

module.exports = router;
