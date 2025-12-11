import React, { useState } from 'react';

// UPDATE: Add quizCategory and quizDifficulty to the function signature
function CreateQuizQuestion({ 
    title, 
    onComplete, 
    totalQuestions, 
    quizCategory,       // <--- NEW PROP
    quizDifficulty,      // <--- NEW PROP
    onSave
}) { 
  // Simulating Question 1/10 and the overall quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [quizName, setQuizName] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: true }, // Pre-select an answer as per wireframe
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  // Add a new state array to hold all questions
  const [createdQuestions, setCreatedQuestions] = useState([]);

  const handleAnswerChange = (index, newText) => {
    const newAnswers = [...answers];
    newAnswers[index].text = newText;
    setAnswers(newAnswers);
  };

  const handleCorrectChange = (index) => {
    const newAnswers = answers.map((answer, i) => ({
      ...answer,
      isCorrect: i === index, // Set the selected answer to true, others to false
    }));
    setAnswers(newAnswers);
  };
  
  const addAnswerChoice = () => {
      setAnswers([...answers, { text: '', isCorrect: false }]);
  };

  const handleNextOrComplete = () => {
    // Basic validation
    const hasCorrectAnswer = answers.some(a => a.isCorrect && a.text.trim());
  	// You might want to remove the quizName check after Q1
    if (!quizName || !questionText || !hasCorrectAnswer) {
      alert('Please enter a quiz name, question, and mark a correct answer.');
      return;
    }
    
    // Simulate saving the question
    // LOG: Now logging the category and difficulty received as props!
    console.log(`Saving Question ${currentQuestionIndex} for Quiz: ${quizName} (${quizCategory}/${quizDifficulty})`);
    
    // 1. Package the current question data
    const newQuestion = {
        questionText: questionText,
        answers: answers,
        // Include the current count (for logging/debugging)
        order: currentQuestionIndex 
    };

    // 2. Accumulate the question
    const updatedQuestions = [...createdQuestions, newQuestion];
    setCreatedQuestions(updatedQuestions);

    // 3. Check the limit
    if (currentQuestionIndex < totalQuestions) {
        // Go to the next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Reset form for the next question
      setQuestionText('');
      setAnswers([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
    } else {
      // Final screen (Creation complete!)
        
        // 4. PREPARE FINAL QUIZ OBJECT
        const finalQuizData = {
            name: quizName,
            category: quizCategory,
            difficulty: quizDifficulty,
            questions: updatedQuestions,
            // Add owner/timestamp metadata (will be added securely in backend)
        };
        
        // 5. CALL THE SAVE API HANDLER (needs to be passed as a prop from App.js)
        // Since you're not passing a 'onSave' prop yet, let's assume one is coming:
        onSave(finalQuizData); 

        alert(`Quiz "${quizName}" with ${totalQuestions} questions ready to save!`);
        onComplete(); // Navigate back to selection screen
    }
};



  return (
    <div className="create-quiz-question">
      <h1>{title}</h1>
      <div className="ui-block">
        
        {/* Quiz Name (Wireframe 5 - visible only on Q1 for setup) */}
        {currentQuestionIndex === 1 && (
            <section style={{marginBottom: '20px'}}>
                <h2>Give your quiz a name</h2>
                <input
                    type="text"
                    className="text-input"
                    placeholder="Enter quiz name"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    required
                />
            </section>
        )}
        
        {/* Question Input (Wireframe 5 & 4) */}
        <section>
          <h2>Question {currentQuestionIndex}</h2>
          <input
            type="text"
            className="text-input"
            placeholder="Enter question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />
        </section>

        {/* Answer Choices (Wireframe 5 & 4) */}
        <section style={{ marginTop: '20px' }}>
          <h2>Answer choices</h2>
          {answers.map((answer, index) => (
            <div key={index} className="answer-input-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <input
                type="text"
                className="text-input"
                placeholder={`Enter answer choice ${index + 1}`}
                value={answer.text}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                style={{ flexGrow: 1, marginBottom: '5px' }}
                required
              />
              <input
                type="checkbox"
                checked={answer.isCorrect}
                onChange={() => handleCorrectChange(index)}
                style={{ marginLeft: '10px' }}
              />
              <label style={{ marginLeft: '5px' }}>Correct answer</label>
            </div>
          ))}
          <div onClick={addAnswerChoice} style={{ cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }}>
            + Add answer choice
          </div>
        </section>
        
        {/* Navigation Button */}
        <button 
            className="primary-btn" 
            onClick={handleNextOrComplete} 
            style={{ marginTop: '25px' }}
        >
          {currentQuestionIndex < totalQuestions ? 'Next' : 'Create Quiz'}
        </button>
      </div>
    </div>
  );
}

export default CreateQuizQuestion;
