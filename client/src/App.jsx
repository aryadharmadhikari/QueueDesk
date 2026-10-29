import React from 'react';
import Visitor from './Visitor.jsx';
import Staff from './Staff.jsx';

export default function App() {
  const isStaff = window.location.pathname.replace(/\/+$/, '') === '/staff';

  return (
    <div className="app">
      <header>
        <h1>QueueDesk</h1>
      </header>
      <main>
        {isStaff ? <Staff /> : <Visitor />}
      </main>
    </div>
  );
}
