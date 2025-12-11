import React, { useState, useEffect } from 'react';
import './App.css';
import LoginScreen from './components/LoginScreen';
import SelectionScreen from './components/SelectionScreen';
import ScoreScreen from './components/ScoreScreen';
import CategorySelection from './components/CategorySelection';
import DifficultySelection from './components/DifficultySelection';
import QuestionScreen from './components/QuestionScreen';
import CreateQuizSetup from './components/CreateQuizSetup.js';
import CreateQuizQuestion from './components/CreateQuizQuestion';
import { auth } from './firebase'; 
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';

const TRIVIA_GAME_NAME = "Trivia Game Name";
const BACKEND_API_URL = 'https://se-trivia-game-api.onrender.com';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null); 
  const [difficultyLevel, setDifficultyLevel] = useState(null);
  const [quizResult, setQuizResult] = useState({ correct: 0, total: 0 });
  // State to track the ID of the challenge/quiz being played, CRITICAL for both score submission and leaderboard fetching.
  const [challengeId, setChallengeId] = useState(null);

  const [quizCategory, setQuizCategory] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('');
  const [quizLimit, setQuizLimit] = useState(0); // <--- NEW STATE FOR QUESTION COUNT
  // ---------------------------------------------

  // Simple function for simulated login (if kept for testing)
  const handleLogin = (simulatedUsername) => {
    setCurrentScreen('selection'); 
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider); 
      const firebaseUser = result.user;

      setUser(firebaseUser);
      setCurrentScreen('selection'); 
      
      console.log('Successfully logged in with Google:', firebaseUser.displayName);

    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setCurrentScreen('login');
  };

  // SECURE SCORE SUBMISSION FUNCTION
  const submitScoreToBackend = async (challengeId, finalScore) => {
    if (!user) {
      console.error("User not logged in. Cannot submit score.");
      return;
    }

    try {
      const idToken = await user.getIdToken(); 
      
      const response = await fetch(`${BACKEND_API_URL}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`, 
        },
        body: JSON.stringify({
          challengeId: challengeId,
          score: finalScore,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Score submission successful:", data.message);
      } else {
        const errorData = await response.json();
        console.error("Score submission failed on server:", errorData.error);
      }

    } catch (error) {
      console.error("Error submitting score:", error);
    }
  };

  // LEADERBOARD FETCHING FUNCTION
  const fetchLeaderboard = async (challengeId) => {
    if (!challengeId) {
      console.error("Cannot fetch leaderboard: Challenge ID is missing.");
      return [];
    }

    try {
      const response = await fetch(`${BACKEND_API_URL}/leaderboard/${challengeId}`);

      if (!response.ok) {
        console.error(`Error fetching leaderboard: ${response.statusText}`);
        return [];
      }

      const leaderboardData = await response.json();
      console.log(`Fetched leaderboard for ${challengeId}:`, leaderboardData);
      return leaderboardData;

    } catch (error) {
      console.error("Network error fetching leaderboard:", error);
      return [];
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (currentScreen === 'login') {
          setCurrentScreen('selection');
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe(); 
  }, [currentScreen]);

  const fetchChallenges = async () => {
    try {
        const response = await fetch(`${BACKEND_API_URL}/challenges`);
        
        if (!response.ok) {
            console.error(`Error fetching challenges: ${response.statusText}`);
            return [];
        }

        const challengeData = await response.json();
        console.log('Fetched challenges:', challengeData);
        return challengeData;
    } catch (error) {
        console.error("Network error fetching challenges:", error);
        return [];
    }
  };

  const fetchQuestions = async (challengeId, difficulty) => { 
    try {
        // Send difficulty as a query parameter
        const response = await fetch(`${BACKEND_API_URL}/questions/${challengeId}?difficulty=${difficulty}`);
        
        if (!response.ok) {
            console.error(`Error fetching questions: ${response.statusText}`);
            return [];
        }

        const questionData = await response.json();
        console.log('Fetched questions:', questionData);
        // Assuming your backend returns an array of questions
        return questionData; 
    } catch (error) {
        console.error("Network error fetching questions:", error);
        return [];
    }
  };

  const handleSetQuizSetup = (setupData) => {
    setQuizCategory(setupData.category);
    setQuizDifficulty(setupData.difficulty);
    setQuizLimit(setupData.limit); // Store the number of questions!
    setCurrentScreen('create-questions');
  };

  // NEW FUNCTION TO SECURELY SAVE THE QUIZ
const saveNewQuizToBackend = async (quizData) => {
    if (!user) {
        console.error("User not logged in. Cannot save quiz.");
        return;
    }

    try {
        const idToken = await user.getIdToken(); 
        
        const response = await fetch(`${BACKEND_API_URL}/quiz`, { // NEW ENDPOINT
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`, // Securely identify the user
            },
            body: JSON.stringify(quizData), // Send the complete quiz object
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Quiz creation successful:", data.quizId);
            return data.quizId;
        } else {
            const errorData = await response.json();
            console.error("Quiz creation failed on server:", errorData.error);
        }

    } catch (error) {
        console.error("Error saving new quiz:", error);
    }
};

  // Function to determine which screen to render
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen 
                 title={TRIVIA_GAME_NAME} 
                 onLogin={handleLogin} 
                 onGoogleLogin={handleGoogleLogin} 
               />;
      case 'selection':
        return <SelectionScreen 
                title={TRIVIA_GAME_NAME} 
                username={user ? user.displayName || user.email : 'Guest'} 
                onSelect={setCurrentScreen} 
              />;
      case 'play-category':
        return <CategorySelection 
                  title={TRIVIA_GAME_NAME} 
                  // Change onSelect to handle the ID
                  onSelect={(screen, id) => { 
                      if (id) {
                          setChallengeId(id); // Set the challenge ID!
                      }
                      setCurrentScreen(screen);
                  }} 
                  fetchChallenges={fetchChallenges} 
              />;
      case 'play-difficulty':
        return <DifficultySelection 
               title={TRIVIA_GAME_NAME} 
               onSelect={(screen, difficulty) => { // Now accepts two parameters
                   setDifficultyLevel(difficulty); // Set the difficulty level!
                   setCurrentScreen(screen);
               }} 
           />;
      case 'play-quiz':
        return <QuestionScreen 
               title={TRIVIA_GAME_NAME} 
               challengeId={challengeId} 
               difficultyLevel={difficultyLevel} // Pass the new state!
               fetchQuestions={fetchQuestions} 
               onQuizFinish={(result) => {
                   setQuizResult(result); 
                   setCurrentScreen('score'); 
               }}
           />;
      case 'create-setup':
        // PASS THE NEW HANDLER TO RECEIVE SETUP DATA
        return <CreateQuizSetup 
                 title={TRIVIA_GAME_NAME} 
                 onNext={handleSetQuizSetup} // <--- UPDATED HANDLER
                 
              />;
      case 'create-questions':
      return <CreateQuizQuestion 
               title={TRIVIA_GAME_NAME} 
               totalQuestions={quizLimit} 
               quizCategory={quizCategory} 
               quizDifficulty={quizDifficulty} 
                onSave={saveNewQuizToBackend} // <--- NEW PROP
               onComplete={() => setCurrentScreen('selection')} 
            />;
      case 'score':
        return <ScoreScreen 
            title={TRIVIA_GAME_NAME} 
            // 👇 Now use the dynamic state!
            score={quizResult} 
            onNewGame={() => setCurrentScreen('play-category')} 
            fetchLeaderboard={fetchLeaderboard}
            challengeId={challengeId}
            onSubmitScore={submitScoreToBackend}
        />;
      default:
        return <LoginScreen 
                 title={TRIVIA_GAME_NAME} 
                 onLogin={handleLogin} 
                 onGoogleLogin={handleGoogleLogin} 
               />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-bar">
          <span className="screen-title">{currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1).replace('-', ' ')}</span>
          {user && <button className="logout-btn" onClick={handleLogout}>Logout</button>}
        </div>
      </header>
      <main className="app-main">
        {renderScreen()}
      </main>
    </div>
  );
}

export default App;