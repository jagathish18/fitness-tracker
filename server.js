require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || process.env.mongoURI || 'mongodb://127.0.0.1:27017/fitness-tracker';

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000
})
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => {
        console.error('MongoDB Initial Connection Error:', err.name, err.message);
        if (err.reason) console.error(err.reason);
    });

mongoose.connection.on('error', err => {
    console.error('MongoDB Runtime Error:', err.name, err.message);
});
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB Disconnected');
});

// Routes Placeholder
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
