import React from 'react';
import ColourMatcher from './ColourMatcher';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Color It!</h1>
      </header>
      <div className="App-content">
        <main className="App-main">
          <ColourMatcher title="Color Matcher" headingLevel="2" />
        </main>
        <aside className="App-aside">
          <div className="App-aside-box">
            <h2>How to use</h2>
            <p>The idea is to create your design in greyscale then generate color scales with matching contrast.</p>
            <h3>Step One: Generate the greyscale</h3>
            <p>Generate a greyscale with even progression in perceived lightness. Just select your desired number of steps.</p>
            <h3>Step Two: Create your design in greyscale</h3>
            <p>Using your favorite design tool, use the values from the generated greyscale to establish contrasts.</p>
            <h3>Step Three: Pick some base colors</h3>
            <p>For each base color, the app generates a scale matching the greyscale in luminance.</p>
            <h3>Step Four: Add color to your design</h3>
            <p>Each greyscale value now has a matching color in each of the color scales. You can now use those in your final design, knowing the result will have the same contrast as the greyscale design.</p>
          </div>
        </aside>
      </div>
      <footer className="App-footer">made by Sylvie Fiquet</footer>
    </div>
  );
}

export default App;
