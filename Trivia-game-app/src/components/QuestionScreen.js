import React, { useState } from 'react';

// Mock data for demonstration
const mockQuestion = {
  category: 'Trivia Category',
  question: 'Question related to the trivia category?',
  choices: ['Answer Choice A', 'Answer Choice B', 'Answer Choice C', 'Answer Choice D'],
  correctAnswerIndex: 0, // A is the correct answer
};

function QuestionScreen({ title, onNext }) {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleAnswerSelect = (index) => {
      // Only allow selection if not yet submitted
      if (!isSubmitted) {
        setSelectedAnswerIndex(index);
      }
  };

  const handleSubmit = () => {
    if (selectedAnswerIndex !== null) {
        setIsSubmitted(true);
        // Logic to update score would go here
    } else {
        alert('Please select an answer before submitting.');
    }
  };

  // Helper to determine the button style based on submission state and correctness
  const getButtonClass = (index) => {
    // Before submission (Questions 1 wireframe)
    if (!isSubmitted) {
      return selectedAnswerIndex === index ? 'selected-btn' : 'secondary-btn';
    }
    
    // After submission (Questions 2/3 wireframes)
    const isCorrect = index === mockQuestion.correctAnswerIndex;
    const isUserSelection = index === selectedAnswerIndex;

    if (isCorrect) {
      // Correct answer (shows checkmark - Wireframe 12)
      return 'correct-answer';
    } else if (isUserSelection && !isCorrect) {
      // Incorrect answer selected by user (shows X - Wireframe 13)
      return 'incorrect-answer';
    }
    // All other options are plain
    return 'secondary-btn';
  };
  
  // Custom button content including checkmark/X
  const getButtonContent = (choice, index) => {
    const isCorrect = index === mockQuestion.correctAnswerIndex;
    const isUserSelection = index === selectedAnswerIndex;
    
    if (isSubmitted && isCorrect) {
      return (
        <>
          {choice} <span style={{marginLeft: '10px'}}>✓</span>
        </>
      );
    } else if (isSubmitted && isUserSelection && !isCorrect) {
       return (
        <>
          {choice} <span style={{marginLeft: '10px'}}>X</span>
        </>
      );
    }
    return choice;
  };


  return (
    <div className="question-screen">
      <h1>{title}</h1>
      <div className="ui-block">
        
        <h2>{mockQuestion.category}</h2>

        {/* Question Display */}
        <div className="question-box" style={{border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px'}}>
          <p style={{fontWeight: 'bold'}}>Question 1</p>
          <p>{mockQuestion.question}</p>
        </div>

        {/* Answer Choices */}
        <div className="answer-choices">
          {mockQuestion.choices.map((choice, index) => (
            <button
              key={index}
              className={`primary-btn ${getButtonClass(index)}`}
              onClick={() => handleAnswerSelect(index)}
              disabled={isSubmitted} // Disable buttons after submission
              style={{ marginBottom: '10px', width: '100%', textAlign: 'left', paddingLeft: '15px' }}
            >
              {getButtonContent(choice, index)}
            </button>
          ))}
        </div>
        
        {/* Submit or Next Button */}
        {!isSubmitted ? (
            <button className="primary-btn" onClick={handleSubmit} style={{ marginTop: '25px' }}>
              Submit
            </button>
        ) : (
            <button className="primary-btn" onClick={onNext} style={{ marginTop: '25px' }}>
              Next
            </button>
        )}
        
      </div>
    </div>
  );
}

export default QuestionScreen;
