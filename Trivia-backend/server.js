// server.js - The main backend server for the Trivia Game

// --- 1. IMPORTS & EXPRESS SETUP ---
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = 3000; // Must match the port used by your frontend (BACKEND_API_URL)

// Middleware Setup
// Enable CORS for frontend access (needed since React runs on a different port/process)
app.use(cors()); 
// Allows Express to read JSON data sent in request bodies
app.use(express.json()); 

// --- 2. FIREBASE ADMIN & DB INITIALIZATION ---
// !!! CRITICAL: UPDATE THIS PATH TO YOUR ACTUAL JSON FILE NAME !!!
const serviceAccount = require('./final-project---se--25-firebase-adminsdk-fbsvc-1ade844c56.json'); 

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


// --- 3. AUTHENTICATION MIDDLEWARE (Your Security Gate) ---

// This function verifies the ID Token sent by the client.
const isAuthenticated = async (req, res, next) => {
    // Expects token in: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or invalid.' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        // Verify the token using Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // Attach user info to the request for route handlers to use
        req.user = decodedToken; 
        next(); // Token is valid, continue to the route handler
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};


// --- 4. API ROUTES ---

// A. PUBLIC ROUTE: Fetch Challenges (Called immediately after login)
app.get('/api/challenges', async (req, res) => {
    try {
        const challengesRef = db.collection('challenges');
        const snapshot = await challengesRef.get();

        if (snapshot.empty) {
            return res.status(200).json([]); // Return empty array if none found
        }

        const challenges = [];
        snapshot.forEach(doc => {
            challenges.push({ id: doc.id, ...doc.data() }); 
        });

        res.status(200).json(challenges);
    } catch (error) {
        console.error('Error fetching challenges:', error);
        res.status(500).json({ error: 'Internal server error fetching challenges.' });
    }
});

// B. PUBLIC ROUTE: Fetch Leaderboard (Called by ScoreScreen)
app.get('/api/leaderboard/:challengeId', async (req, res) => {
    const { challengeId } = req.params;

    try {
        const highScoresRef = db.collection('highscores');
        
        const snapshot = await highScoresRef
            .where('challengeId', '==', challengeId) 
            .orderBy('score', 'desc')
            .limit(10)
            .get();

        const leaderboard = [];
        snapshot.forEach(doc => {
            leaderboard.push(doc.data());
        });

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Internal server error fetching leaderboard.' });
    }
});

// --- GET /api/questions/:challengeId (Filtering by Difficulty) ---
app.get('/api/questions/:challengeId', async (req, res) => {
    const { challengeId } = req.params;
    // ⭐️ Read the difficulty from the query string ⭐️
    const { difficulty } = req.query; 

    try {
        const challengeDoc = await db.collection('challenges').doc(challengeId).get();

        if (!challengeDoc.exists) {
            return res.status(404).json({ error: 'Challenge not found.' });
        }

        let questions = challengeDoc.data().questions || [];

        // ⭐️ FILTER QUESTIONS BY DIFFICULTY ⭐️
        if (difficulty) {
            questions = questions.filter(q => q.difficulty === difficulty);
        }

        // Send the filtered list back
        res.status(200).json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Internal server error while fetching questions.' });
    }
});

// C. SECURE ROUTE: Submit Score (Called by ScoreScreen's onSubmitScore)
// The 'isAuthenticated' middleware runs first to check the user's token
app.post('/api/score', isAuthenticated, async (req, res) => {
    const { challengeId, score } = req.body;
    
    // Get user data from the token payload attached by isAuthenticated middleware
    const { uid, name, email } = req.user; 

    if (!challengeId || typeof score !== 'number') {
        return res.status(400).json({ error: 'Missing challenge ID or invalid score.' });
    }

    try {
        // Add the new score to the 'highscores' collection
        const newScoreRef = await db.collection('highscores').add({
            challengeId: challengeId,
            score: score,
            userId: uid,
            username: name || email, // Use display name or email from token
            timestamp: admin.firestore.FieldValue.serverTimestamp() // Use Firebase server timestamp
        });

        res.status(201).json({ 
            message: 'Score recorded successfully.', 
            scoreId: newScoreRef.id 
        });
    } catch (error) {
        console.error('Error recording high score:', error);
        res.status(500).json({ error: 'Failed to record high score.' });
    }
});


// --- 5. START SERVER ---
app.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`🚀 Backend Server Running!`);
    console.log(`http://localhost:${PORT}`);
    console.log(`==========================================\n`);
});