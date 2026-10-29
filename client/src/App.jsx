import { useState } from 'react';
import Visitor from './Visitor.jsx';
import Staff from './Staff.jsx';

export default function App() {
  const [page, setPage] = useState('visitor');

  return (
    <div className="app">
      <header className="header">
        <button className="brand" onClick={() => setPage('visitor')} aria-label="QueueDesk home">
          <span className="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
          <span>QueueDesk</span>
        </button>
        <nav className="nav" aria-label="Main navigation">
          <button className={page === 'visitor' ? 'active' : ''} onClick={() => setPage('visitor')}>Your ticket</button>
          <button className={page === 'staff' ? 'active' : ''} onClick={() => setPage('staff')}>Staff desk</button>
        </nav>
      </header>
      <main className="main">
        {page === 'visitor' ? <Visitor /> : <Staff />}
      </main>
      <footer className="footer"><span>QueueDesk</span><span>A little less waiting around.</span></footer>
    </div>
  );
}
