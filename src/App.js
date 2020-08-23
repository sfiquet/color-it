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
          <ColourMatcher />
        </main>
        <aside className="App-aside">
          <div className="App-aside-box">
            Design in greyscale then generate colour scales with matching contrast
          </div>
        </aside>
      </div>
      <footer className="App-footer">made by Sylvie Fiquet</footer>
    </div>
  );
}

export default App;
