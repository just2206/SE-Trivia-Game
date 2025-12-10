import React, { useState, useEffect } from 'react';

// NOTE: We no longer rely on mockQuestion, but we'll use a local state for the questions list.
// The component is now designed to handle one question at a time from a list.

// Updated props: onQuizFinish is the final callback to App.js
function QuestionScreen({ title, onQuizFinish, fetchQuestions, challengeId, difficultyLevel }) {
    // State for the list of questions for this challenge
    const [questions, setQuestions] = useState([]);
    // State for overall score tracking
    const [score, setScore] = useState({ correct: 0, total: 0 }); 

    // State to manage the current question flow
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch the questions when the component first loads
    useEffect(() => {
        const loadQuestions = async () => {
            if (challengeId) {
                // Fetch the real questions from the backend API (we'll implement this function next)
                const fetchedQuestions = await fetchQuestions(challengeId, difficultyLevel);
                setQuestions(fetchedQuestions);
            }
            setIsLoading(false);
        };
        loadQuestions();
    }, [challengeId, fetchQuestions]);


    // Return early if loading or no questions
    if (isLoading) {
        return <div className="question-screen">Loading questions...</div>;
    }
    if (questions.length === 0) {
        return <div className="question-screen">No questions found for this challenge.</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];


    const handleAnswerSelect = (index) => {
        // Only allow selection if not yet submitted
        if (!isSubmitted) {
            setSelectedAnswerIndex(index);
        }
    };

    const handleSubmit = () => {
        if (selectedAnswerIndex !== null) {
            setIsSubmitted(true);
            
            // ⭐️ LOGIC TO UPDATE SCORE ⭐️
            const isCorrect = selectedAnswerIndex === currentQuestion.correctAnswerIndex;
            if (isCorrect) {
                setScore(prev => ({ 
                    correct: prev.correct + 1, 
                    total: prev.total + 1 
                }));
            } else {
                setScore(prev => ({ 
                    correct: prev.correct, 
                    total: prev.total + 1 
                }));
            }
            // ⭐️ END LOGIC TO UPDATE SCORE ⭐️
            
        } else {
            alert('Please select an answer before submitting.');
        }
    };
    
    // Logic to move to the next question or finish the quiz
    const handleNext = () => {
        // If this is the last question, finish the quiz
        if (currentQuestionIndex === questions.length - 1) {
            // Call the finish prop with the final score
            onQuizFinish(score); 
        } else {
            // Move to the next question
            setCurrentQuestionIndex(prev => prev + 1);
            // Reset question state
            setSelectedAnswerIndex(null);
            setIsSubmitted(false);
        }
    };


    // Helper to determine the button style
    const getButtonClass = (index) => {
        if (!isSubmitted) {
            return selectedAnswerIndex === index ? 'selected-btn' : 'secondary-btn';
        }
        
        const isCorrect = index === currentQuestion.correctAnswerIndex;
        const isUserSelection = index === selectedAnswerIndex;

        if (isCorrect) {
            return 'correct-answer';
        } else if (isUserSelection && !isCorrect) {
            return 'incorrect-answer';
        }
        return 'secondary-btn';
    };
    
    // Custom button content including checkmark/X
    const getButtonContent = (choice, index) => {
        const isCorrect = index === currentQuestion.correctAnswerIndex;
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
                
                <h2>{currentQuestion.category || 'Trivia'}</h2>

                {/* Question Display */}
                <div className="question-box" style={{border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '4px'}}>
                    <p style={{fontWeight: 'bold'}}>Question {currentQuestionIndex + 1} of {questions.length}</p>
                    <p>{currentQuestion.question}</p>
                </div>

                {/* Answer Choices */}
                <div className="answer-choices">
                    {currentQuestion.choices.map((choice, index) => (
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
                    <button 
                        className="primary-btn" 
                        onClick={handleNext} // Use new flow handler
                        style={{ marginTop: '25px' }}
                    >
                        {currentQuestionIndex === questions.length - 1 ? 'View Score' : 'Next Question'}
                    </button>
                )}
                
            </div>
        </div>
    );
}

export default QuestionScreen;