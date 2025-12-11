import React, { useState } from 'react';

function CreateQuizSetup({ title, onNext }) {
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  
  const difficultyOptions = ['Beginner', 'Normal', 'Hard', 'Extreme'];
  const questionOptions = [5, 10, 15, 20];

  const handleNext = () => {
  // Ensure numQuestions is a number before passing it
  const quizLimit = parseInt(numQuestions, 10); 
  
  if (category && difficulty && quizLimit > 0) {
    // Pass the category, difficulty, AND the number of questions back to App.js
    onNext({
      category: category,
      difficulty: difficulty,
      limit: quizLimit // <-- PASS THE DATA HERE
    });
  } else {
    alert('Please complete all fields!');
  }
};

  return (
    <div className="create-quiz-setup">
      <h1>{title}</h1>
      <div className="ui-block">
        
        {/* Category Input (Wireframe 3) */}
        <section>
          <h2>What category is your quiz?</h2>
          <input
            type="text"
            className="text-input"
            placeholder="Enter category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </section>

        {/* Difficulty Selection (Wireframe 3) */}
        <section style={{ marginTop: '20px' }}>
          <h2>Select a difficulty for your quiz</h2>
          <div className="button-group">
            {difficultyOptions.map(level => (
              <button
                key={level}
                className={`primary-btn ${difficulty === level ? 'selected-btn' : 'secondary-btn'}`}
                onClick={() => setDifficulty(level)}
                style={{ marginBottom: '10px', width: '100%' }}
              >
                {level}
              </button>
            ))}
          </div>
        </section>

        {/* Number of Questions (Wireframe 3) */}
        <section style={{ marginTop: '20px' }}>
          <h2>How many questions would you like your quiz to have?</h2>
          {/* Using a select element to simulate the drop-down (Wireframe 3/7) */}
          <select
            className="dropdown-input"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            required
          >
            {questionOptions.map(num => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </section>
        
        <button className="primary-btn" onClick={handleNext} style={{ marginTop: '25px' }}>
          Next
        </button>
      </div>
    </div>
  );
}

export default CreateQuizSetup;
