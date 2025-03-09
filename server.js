const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'users';
let db;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB and initialize database
async function initDb() {
    try {
        const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        db = client.db(dbName);

        // Create users collection if it doesn't exist
        const collections = await db.listCollections({ name: 'users' }).toArray();
        if (collections.length === 0) {
            await db.createCollection('users');
        }

        // Insert sample users if collection is empty
        const usersCollection = db.collection('users');
        const userCount = await usersCollection.countDocuments();
        if (userCount === 0) {
            await usersCollection.insertMany([
                { username: 'sheraz1', password: 'password123' },
                { username: 'sheraz2', password: 'password123' }
            ]);
            console.log('Sample users inserted');
        }
        
        console.log('MongoDB database initialized');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

// Initialize the database
initDb();

// Routes
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await db.collection('users').findOne({ username, password });
        
        if (user) {
            res.json({ success: true, message: 'Successfully Logged In' });
        } else {
            res.json({ success: false, message: 'Login Failed - Record Not Found in Database' });
        }
    } catch (err) {
        console.error('Login query error:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
