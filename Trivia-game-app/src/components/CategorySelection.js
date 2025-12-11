import React, { useState, useEffect } from 'react';

// NOTE: Add fetchChallenges to the props list!
function CategorySelection({ title, onSelect, fetchChallenges }) {
    
    // New state to store the real challenges
    const [allChallenges, setAllChallenges] = useState([]); // Renamed to allChallenges
    const [isLoading, setIsLoading] = useState(true);

    // Use useEffect to fetch challenges when the component mounts
    useEffect(() => {
        const loadChallenges = async () => {
            const data = await fetchChallenges();
            setAllChallenges(data);
            setIsLoading(false);
        };
        
        loadChallenges();
    }, [fetchChallenges]); 

    // Handle selection and move to the next step
    const handleSelection = (challenge) => {
        console.log(`Selected challenge ID: ${challenge.id}, Is Custom: ${challenge.isCustom}`);
        
        if (challenge.isCustom) {
            // Custom quizzes skip difficulty and go straight to the quiz
            // NOTE: The custom quiz document already contains the questions.
            // App.js fetchQuestions will handle getting them by challenge.id.
            onSelect('play-quiz', challenge.id); 
        } else {
            // Fixed challenges go to the difficulty selection screen
            onSelect('play-difficulty', challenge.id); 
        }
    };
    
    // Split challenges into groups for display
    const fixedChallenges = allChallenges.filter(c => !c.isCustom);
    const customQuizzes = allChallenges.filter(c => c.isCustom);


    return (
        <div className="category-selection-screen">
            <h1>{title}</h1>
            <div className="ui-block">
                {isLoading && <p>Loading challenges from the backend...</p>}
                
                {allChallenges.length === 0 && !isLoading && (
                    <p>No challenges available. Check Firestore and server logs.</p>
                )}

                {/* --- 1. FIXED CHALLENGES --- */}
                {fixedChallenges.length > 0 && (
                    <>
                        <h2>Official Categories</h2>
                        <div className="button-group">
                            {fixedChallenges.map((challenge) => (
                                <button
                                    key={challenge.id} 
                                    onClick={() => handleSelection(challenge)} 
                                    style={{ marginBottom: '10px', width: '100%' }}
                                >
                                    {challenge.name || challenge.id} 
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* --- 2. CUSTOM QUIZZES --- */}
                {customQuizzes.length > 0 && (
                    <>
                        <h2 style={{ marginTop: '30px' }}>Your Custom Quizzes (Ready to Play)</h2>
                        <div className="button-group">
                            {customQuizzes.map((quiz) => (
                                <button
                                    key={quiz.id} 
                                    onClick={() => handleSelection(quiz)} 
                                    className="custom-quiz-btn" // Optional: Add a custom style class
                                    style={{ marginBottom: '10px', width: '100%', backgroundColor: '#5cb85c', color: 'white' }}
                                >
                                    {quiz.name || `Quiz ${quiz.id}`} 
                                </button>
                            ))}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}

export default CategorySelection;