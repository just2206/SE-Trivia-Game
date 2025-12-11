// server.js - The main backend server for the Trivia Game
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// --- 1. IMPORTS & EXPRESS SETUP ---
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware Setup
// Enable CORS for frontend access (needed since React runs on a different port/process)
// Configure CORS options
const corsOptions = {
  // 1. Allow only your specific Render frontend domain
  origin: 'https://se-trivia-game.onrender.com', 
  // 2. Allow common methods (GET, POST, etc.)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
  // 3. Allow credentials (important for Authorization headers)
  credentials: true, 
  // 4. *** CRITICAL FIX: Explicitly allow headers ***
  allowedHeaders: 'Content-Type, Authorization', 
};

// Apply the configured CORS middleware
app.use(cors(corsOptions)); 
// Allows Express to read JSON data sent in request bodies
app.use(express.json()); 


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

// A. PUBLIC ROUTE: Fetch Challenges (Updated to fetch custom quizzes too)
app.get('/api/challenges', async (req, res) => {
    try {
        const challengesRef = db.collection('challenges');
        const customQuizzesRef = db.collection('quizzes'); // <-- New Collection Ref

        // 1. Fetch fixed challenges
        const challengesSnapshot = await challengesRef.get();
        const challenges = [];
        challengesSnapshot.forEach(doc => {
            // NOTE: Fixed challenges are given an implicit 'isCustom: false' here
            challenges.push({ id: doc.id, ...doc.data(), isCustom: false }); 
        });

        // 2. Fetch custom quizzes (which already have isCustom: true from the POST route)
        const customQuizzesSnapshot = await customQuizzesRef.get();
        customQuizzesSnapshot.forEach(doc => {
            // Note: Custom quizzes already have isCustom: true in the document data
            challenges.push({ id: doc.id, ...doc.data() }); 
        });

        // 3. Combine and send both lists
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
    const { difficulty } = req.query; 

    try {
        let questions = [];
        let isCustomQuiz = false;
        let challengeDoc = await db.collection('challenges').doc(challengeId).get();
        
        if (challengeDoc.exists) {
            questions = challengeDoc.data().questions || [];
        } else {
            challengeDoc = await db.collection('quizzes').doc(challengeId).get();
            
            if (challengeDoc.exists) {
                isCustomQuiz = true;
                // ⭐️ FIX: Map the custom quiz format to the fixed quiz format ⭐️
                const rawQuestions = challengeDoc.data().questions || [];
                questions = rawQuestions.map(q => {
                    // Find the index of the correct answer
                    const correctIndex = q.answers.findIndex(a => a.isCorrect);
                    
                    return {
                        // Rename questionText to question
                        question: q.questionText, 
                        // Map the array of answer objects ({text, isCorrect}) to an array of strings
                        choices: q.answers.map(a => a.text),
                        // Set the calculated correct index
                        correctAnswerIndex: correctIndex
                    };
                });
            } else {
                return res.status(404).json({ error: 'Challenge not found in challenges or quizzes.' });
            }
        }
        
        // Apply difficulty filtering ONLY for FIXED challenges
        if (difficulty && !isCustomQuiz) {
            questions = questions.filter(q => q.difficulty === difficulty);
        }

        // Send the list back
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

// NEW ROUTE: Securely save a new user-created quiz
app.post('/api/quiz', async (req, res) => {
    // 1. Authentication and Authorization (Same as /api/score)
    const idToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!idToken) {
        return res.status(401).send({ error: "Authorization required" });
    }

    let decodedToken;
    try {
        // Verify the ID token and get the user's UID
        decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
        return res.status(401).send({ error: "Invalid or expired token" });
    }

    const { name, category, difficulty, questions } = req.body;

    // 2. Data Validation (Basic)
    if (!name || !category || !difficulty || !questions || questions.length === 0) {
        return res.status(400).send({ error: "Missing required quiz data." });
    }

    // 3. Prepare the Quiz Document for Firestore
    const newQuiz = {
        name: name,
        category: category,
        difficulty: difficulty,
        // Associate the quiz with the creator's UID
        creatorUid: decodedToken.uid, 
        questions: questions,
        // Add a server-side timestamp
        createdAt: admin.firestore.FieldValue.serverTimestamp(), 
        isCustom: true // Useful for filtering created quizzes
    };

    try {
        // 4. Save the quiz to a 'quizzes' collection
        const docRef = await db.collection('quizzes').add(newQuiz);

        // 5. Respond to the client
        res.status(201).send({ 
            message: "Quiz saved successfully!", 
            quizId: docRef.id 
        });
    } catch (error) {
        console.error("Error saving quiz to Firestore:", error);
        res.status(500).send({ error: "Failed to save quiz to database." });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// --- 5. START SERVER ---
// app.listen(PORT, () => {
//     console.log(`\n==========================================`);
//     console.log(`🚀 Backend Server Running!`);
//     console.log(`http://localhost:${PORT}`);
//     console.log(`==========================================\n`);
// });


// /**
//  * Import function triggers from their respective submodules:
//  *
//  * const {onCall} = require("firebase-functions/v2/https");
//  * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
//  *
//  * See a full list of supported triggers at https://firebase.google.com/docs/functions
//  */

// const {setGlobalOptions} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/https");
// const logger = require("firebase-functions/logger");

// // For cost control, you can set the maximum number of containers that can be
// // running at the same time. This helps mitigate the impact of unexpected
// // traffic spikes by instead downgrading performance. This limit is a
// // per-function limit. You can override the limit for each function using the
// // `maxInstances` option in the function's options, e.g.
// // `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// // NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// // functions should each use functions.runWith({ maxInstances: 10 }) instead.
// // In the v1 API, each function can only serve one request per container, so
// // this will be the maximum concurrent request count.
// setGlobalOptions({ maxInstances: 10 });

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started

// // exports.helloWorld = onRequest((request, response) => {
// //   logger.info("Hello logs!", {structuredData: true});
// //   response.send("Hello from Firebase!");
// // });
