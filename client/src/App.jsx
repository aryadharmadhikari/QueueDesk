import React from 'react';
import Visitor from './Visitor.jsx';
import Staff from './Staff.jsx';

export default function App() {
  const isStaff = window.location.pathname.replace(/\/+$/, '') === '/staff';

  return (
    <div className="app">
      <header className="site-header">
        <div className="container">
          <a className="brand" href="/">
            <span className="brand-mark">Q</span>
            QueueDesk
          </a>
          <nav>
            <a href="/" className={isStaff ? '' : 'active'}>Join queue</a>
            <a href="/staff" className={isStaff ? 'active' : ''}>Staff desk</a>
          </nav>
        </div>
      </header>

      <main className={`container ${isStaff ? 'staff' : 'visitor'}`}>
        {isStaff ? <Staff /> : <Visitor />}
      </main>

      <footer className="site-footer container">
        QueueDesk &middot; The queue updates every 5 seconds
      </footer>
    </div>
  );
}
