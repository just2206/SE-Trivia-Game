import React, { useState } from 'react';
import './App.css';
import LoginScreen from './components/LoginScreen';
import SelectionScreen from './components/SelectionScreen';
import ScoreScreen from './components/ScoreScreen';
import CategorySelection from './components/CategorySelection';
import DifficultySelection from './components/DifficultySelection';
import QuestionScreen from './components/QuestionScreen';
import CreateQuizSetup from './components/CreateQuizSetup';
import CreateQuizQuestion from './components/CreateQuizQuestion';

const TRIVIA_GAME_NAME = "Trivia Game Name";

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [username, setUsername] = useState('');
  const [score, setScore] = useState({ correct: 8, total: 10 });

  // Simple function to simulate login and navigate
  const handleLogin = (user) => {
    setUsername(user);
    setCurrentScreen('selection'); // Navigates to the Create or Play Selection screen [cite: 5]
  };

  // Function to determine which screen to render
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        // Renders the login screen [cite: 5]
        return <LoginScreen title={TRIVIA_GAME_NAME} onLogin={handleLogin} />;
      case 'selection':
        // Renders the create or play selection screen [cite: 5]
        return <SelectionScreen title={TRIVIA_GAME_NAME} username={username} onSelect={setCurrentScreen} />;
      case 'play-category':
        // Renders category selection for playing 
        return <CategorySelection title={TRIVIA_GAME_NAME} onSelect={setCurrentScreen} />;
      case 'play-difficulty':
        // Renders difficulty selection for playing 
        return <DifficultySelection title={TRIVIA_GAME_NAME} onSelect={setCurrentScreen} />;
      case 'play-quiz':
        // Renders the question screen 
        return <QuestionScreen title={TRIVIA_GAME_NAME} onNext={() => setCurrentScreen('score')} />;
      case 'create-setup':
        // Renders the quiz setup screen (Category, Difficulty, # Questions) 
        return <CreateQuizSetup title={TRIVIA_GAME_NAME} onNext={() => setCurrentScreen('create-questions')} />;
      case 'create-questions':
        // Renders the screen to input questions 
        return <CreateQuizQuestion title={TRIVIA_GAME_NAME} onComplete={() => setCurrentScreen('selection')} />;
      case 'score':
        // Renders the final score screen [cite: 12, 13]
        return <ScoreScreen title={TRIVIA_GAME_NAME} score={score} onNewGame={() => setCurrentScreen('selection')} />;
      default:
        return <LoginScreen title={TRIVIA_GAME_NAME} onLogin={handleLogin} />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-bar">
          <span className="screen-title">{currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1).replace('-', ' ')}</span>
          {currentScreen !== 'login' && <button className="logout-btn" onClick={() => setCurrentScreen('login')}>Logout</button>}
        </div>
      </header>
      <main className="app-main">
        {renderScreen()}
      </main>
    </div>
  );
}

export default App;
