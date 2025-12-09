import React from 'react';

function ScoreScreen({ title, score, onNewGame }) {
  // score is expected to be an object like { correct: 8, total: 10 }

  const percentage = Math.round((score.correct / score.total) * 100);

  return (
    <div className="score-screen">
      <h1>{title}</h1>
      <div className="ui-block">
        <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
          Congratulations!
        </p>
        <p style={{ fontSize: '1.2em', marginBottom: '30px' }}>
          You completed the level!
        </p>

        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }}>
          <p style={{ fontSize: '1.2em' }}>Here's your score:</p>
          <p style={{ fontSize: '2em', fontWeight: 'bold', margin: '10px 0' }}>
            {score.correct}/{score.total} correct
          </p>
          <p style={{ fontSize: '3em', fontWeight: 'bold', color: '#333', margin: '15px 0' }}>
            {percentage}%
          </p>
          <p style={{ fontSize: '1.5em', fontStyle: 'italic', color: '#555' }}>
            Great job!
          </p>
        </div>

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
