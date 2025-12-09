import React from 'react';

function SelectionScreen({ title, username, onSelect }) {
  return (
    <div className="selection-screen">
      <h1>{title}</h1>
      <p>Hello, **{username}**! Welcome to **{title}**!</p>
      <div className="ui-block">
        <h2>Would like to play or create your own quiz?</h2>
        <button
          className="primary-btn"
          onClick={() => onSelect('play-category')}
        >
          Play a quiz
        </button>
        <button
          className="primary-btn"
          onClick={() => onSelect('create-setup')}
          style={{ marginTop: '15px' }}
        >
          Create your own
        </button>
      </div>
    </div>
  );
}

export default SelectionScreen;
