const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number }, // in grams
    carbs: { type: Number }, // in grams
    fats: { type: Number }, // in grams
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Meal', MealSchema);
