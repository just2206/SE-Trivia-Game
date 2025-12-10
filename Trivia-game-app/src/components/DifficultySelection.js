import React from 'react';

function DifficultySelection({ title, onSelect }) {
  // Options based on the wireframe
  const difficultyOptions = ['Beginner', 'Normal', 'Hard', 'Extreme'];

  // Handle difficulty selection and start the quiz
    const handleSelection = (difficulty) => {
        console.log(`Selected difficulty: ${difficulty}`);
        // ⭐️ PASS THE SCREEN AND THE SELECTED DIFFICULTY ⭐️
        onSelect('play-quiz', difficulty); 
    };

  return (
    <div className="difficulty-selection-screen">
      <h1>{title}</h1>
      <div className="ui-block">
        <h2>Select a difficulty</h2>
        <div className="button-group">
          {difficultyOptions.map((level) => (
            <button
              key={level}
              className="primary-btn secondary-btn"
              onClick={() => handleSelection(level)}
              style={{ marginBottom: '10px', width: '100%' }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DifficultySelection;
