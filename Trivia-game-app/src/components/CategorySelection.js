import React, { useState, useEffect } from 'react';

// NOTE: Add fetchChallenges to the props list!
function CategorySelection({ title, onSelect, fetchChallenges }) {
    
    // New state to store the real challenges
    const [challenges, setChallenges] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);

    // Use useEffect to fetch challenges when the component mounts
    useEffect(() => {
        const loadChallenges = async () => {
            const data = await fetchChallenges();
            setChallenges(data);
            setIsLoading(false);
        };
        
        loadChallenges();
    }, [fetchChallenges]); // Reruns if the fetch function changes (usually never)


    // Handle category selection and move to the next step (Difficulty Selection)
    // 1. Change onSelect to take both the screen AND the Challenge ID
    const handleSelection = (challengeId) => {
        console.log(`Selected challenge ID: ${challengeId}`);
        // PASS the ID along with the screen change
        onSelect('play-difficulty', challengeId); 
    };

    return (
        <div className="category-selection-screen">
            <h1>{title}</h1>
            <div className="ui-block">
                <h2>What category would you like to play?</h2>
                <div className="button-group">
                    {isLoading ? (
                        <p>Loading challenges from the backend...</p>
                    ) : challenges.length === 0 ? (
                         <p>No challenges available. Check Firestore and server logs.</p>
                    ) : (
                        // Map over the real challenges fetched from Firestore
                        challenges.map((challenge) => (
                            <button
                              key={challenge.id} 
                              // ...
                              onClick={() => handleSelection(challenge.id)} // Pass the real ID
                              style={{ marginBottom: '10px', width: '100%' }}
                            >
                                {challenge.name || challenge.id} 
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default CategorySelection;