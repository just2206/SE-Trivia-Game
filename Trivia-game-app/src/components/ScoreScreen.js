import React, { useState, useEffect } from 'react';

// NOTE: All props must be explicitly listed here to avoid 'is not defined' errors
function ScoreScreen({ title, score, onNewGame, fetchLeaderboard, challengeId, onSubmitScore }) {
    
    // State to hold the fetched leaderboard data
    const [leaderboard, setLeaderboard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // State to ensure score is submitted only once on load
    const [isSubmitted, setIsSubmitted] = useState(false); 

    // 1. FIXED: Ensure percentage calculation is present
    // score is expected to be an object like { correct: 8, total: 10 }
    const percentage = Math.round((score.correct / score.total) * 100);

    useEffect(() => {
        // A. Score Submission Logic (runs once)
        if (challengeId && onSubmitScore && !isSubmitted) {
            console.log(`Submitting score ${score.correct} for challenge ${challengeId}`);
            
            // Call the secure backend function
            onSubmitScore(challengeId, score.correct); 
            setIsSubmitted(true);
        }

        // B. Leaderboard Fetching Logic (runs immediately)
        const loadLeaderboard = async () => {
            if (challengeId && fetchLeaderboard) {
                // This call should succeed once the Firestore index finishes building
                const data = await fetchLeaderboard(challengeId); 
                setLeaderboard(data);
            }
            setIsLoading(false);
        };

        loadLeaderboard();
        
        // Ensure all external values are in the dependency array
    }, [challengeId, fetchLeaderboard, onSubmitScore, isSubmitted, score.correct]); 

    
    // Helper function to render the leaderboard list
    const renderLeaderboard = () => {
        if (isLoading) {
            return <p>Loading Leaderboard...</p>;
        }
        if (!leaderboard || leaderboard.length === 0) {
            return <p>No high scores recorded yet. Be the first!</p>;
        }

        return (
            <ol style={{ paddingLeft: '20px', textAlign: 'left' }}>
                {leaderboard.map((entry, index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>
                        {entry.username || 'Anonymous'}: **{entry.score}** points
                    </li>
                ))}
            </ol>
        );
    };

    return (
        <div className="score-screen">
            <h1>{title}</h1>
            <div className="ui-block">
                <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
                    Congratulations!
                </p>
                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '2em', fontWeight: 'bold', margin: '10px 0' }}>
                        {score.correct}/{score.total} correct
                    </p>
                    <p style={{ fontSize: '3em', fontWeight: 'bold', color: '#333', margin: '15px 0' }}>
                        {percentage}%
                    </p>
                </div>
                
                <h2 style={{ marginTop: '30px' }}>Current Top Scores</h2>
                {renderLeaderboard()}

                <button 
                    className="primary-btn small-btn" 
                    onClick={onNewGame} 
                    style={{ marginTop: '25px', width: '50%' }}
                >
                    New Game
                </button>
            </div>
        </div>
    );
}

export default ScoreScreen;