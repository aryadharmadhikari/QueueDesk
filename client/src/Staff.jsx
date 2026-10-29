import React, { useEffect, useState } from 'react';
import { request } from './api.js';

export default function Staff() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function loadQueue() {
    const data = await request('/queue');
    setTickets(data);
    setError('');
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await request('/queue');
        if (active) { setTickets(data); setError(''); }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    const timer = setInterval(load, 5000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  async function update(path) {
    setBusy(true);
    setError('');
    try {
      await request(path, { method: 'POST' });
      await loadQueue();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const called = tickets.find(ticket => ticket.status === 'called');
  const waiting = tickets.filter(ticket => ticket.status === 'waiting');

  return (
    <section className="content staff-page">
      <p className="eyebrow"><span className="dot" /> Staff desk</p>
      <div className="staff-heading"><div><h1>Keep the line moving.</h1><p className="intro">Call the next ticket when you're ready.</p></div>
        <div className="waiting-count"><strong>{waiting.length}</strong><span>waiting</span></div></div>
      {error && <p className="notice error" role="alert">{error}</p>}
      <div className="desk-section">
        <div className="section-heading"><h2>At the counter</h2><span>NOW SERVING</span></div>
        <div className="counter-row">
          <div>{called ? <><p className="counter-number">#{String(called.number).padStart(3, '0')}</p><p className="muted">Ticket called</p></> : <><p className="counter-empty">No one is being served</p><p className="muted">Call the next ticket to get started.</p></>}</div>
          {called ? <button className="primary" disabled={busy} onClick={() => update(`/tickets/${called.number}/serve`)}>Mark served <span aria-hidden="true">→</span></button>
            : <button className="primary" disabled={busy || loading || waiting.length === 0} onClick={() => update('/queue/call-next')}>Call next <span aria-hidden="true">→</span></button>}
        </div>
      </div>
      <div className="desk-section queue-section">
        <div className="section-heading"><h2>Waiting queue</h2><span>{waiting.length} {waiting.length === 1 ? 'TICKET' : 'TICKETS'}</span></div>
        {loading ? <p className="empty">Loading queue...</p> : waiting.length === 0 ? <p className="empty">No tickets waiting. New tickets will appear here.</p> :
          <ol className="queue-list">{waiting.map((ticket, index) => <li key={ticket.number}><span className="queue-position">{String(index + 1).padStart(2, '0')}</span><strong>Ticket #{String(ticket.number).padStart(3, '0')}</strong><span className="queue-label">Waiting</span></li>)}</ol>}
      </div>
    </section>
  );
}
