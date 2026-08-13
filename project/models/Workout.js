const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Workout' }, // e.g., "Leg Day"
    type: { type: String, required: true }, // Cardio, Strength, etc.
    duration: { type: Number, required: true }, // in minutes
    calories: { type: Number, required: true },
    exercises: [{
        name: { type: String, required: true },
        sets: [{
            reps: { type: Number, required: true },
            weight: { type: Number, required: true }
        }]
    }],
    notes: { type: String },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workout', WorkoutSchema);
