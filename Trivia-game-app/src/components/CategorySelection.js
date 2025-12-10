import React from 'react';

function CategorySelection({ title, onSelect }) {
  // Mock list of categories based on the wireframe
  const categories = ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'];

  // Handle category selection and move to the next step (Difficulty Selection)
  const handleSelection = (category) => {
    console.log(`Selected category: ${category}`);
    onSelect('play-difficulty');
  };

  return (
    <div className="category-selection-screen">
      <h1>{title}</h1>
      <div className="ui-block">
        <h2>What category would you like to play?</h2>
        <div className="button-group">
          {categories.map((category) => (
            <button
              key={category}
              className="primary-btn secondary-btn"
              onClick={() => handleSelection(category)}
              style={{ marginBottom: '10px', width: '100%' }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategorySelection;
