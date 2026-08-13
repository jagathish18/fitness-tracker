const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google Auth users
    googleId: { type: String },
    metrics: {
        weight: Number,
        height: Number,
        goal: String, // e.g., "Lose Weight", "Gain Muscle"
        gender: String,
        dob: Date,
        activityLevel: String, // e.g., "Not Very Active", "Active"
        goalWeight: Number,
        goalWeight: Number,
        weeklyGoal: String, // e.g., "Lose 0.5kg per week"
        dailyCalories: Number
    },
    dietaryPreferences: [String],
    obstacles: [String],
    location: {
        country: String,
        zip: String
    },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
