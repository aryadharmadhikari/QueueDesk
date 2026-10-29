import React, { useState } from 'react';
import Visitor from './Visitor.jsx';
import Staff from './Staff.jsx';

export default function App() {
  const [page, setPage] = useState('visitor');

  return (
    <div className="app">
      <header>
        <h1>QueueDesk</h1>
        <nav aria-label="Main navigation">
          <button type="button" aria-pressed={page === 'visitor'} onClick={() => setPage('visitor')}>Your ticket</button>
          <button type="button" aria-pressed={page === 'staff'} onClick={() => setPage('staff')}>Staff desk</button>
        </nav>
      </header>
      <main>
        {page === 'visitor' ? <Visitor /> : <Staff />}
      </main>
    </div>
  );
}
