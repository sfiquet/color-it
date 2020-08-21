import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Color It!</h1>
      </header>
      <div className="App-content">
        <main className="App-main">The colours go here</main>
        <aside className="App-aside">
          Design in greyscale then generate colour scales with matching contrast
        </aside>
      </div>
      <footer className="App-footer">made by Sylvie Fiquet</footer>
    </div>
  );
}

export default App;
