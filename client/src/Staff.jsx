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

  function cancel(number) {
    if (window.confirm(`Cancel ticket #${number}?`)) update(`/tickets/${number}/cancel`);
  }

  const called = tickets.find(ticket => ticket.status === 'called');
  const waiting = tickets.filter(ticket => ticket.status === 'waiting');

  return (
    <section>
      <h1>Staff desk</h1>
      <p className="lead">Call visitors one at a time and mark them as served.</p>
      {error && <p className="error" role="alert">{error}</p>}

      <div className="staff-grid">
        <div className="card counter-card">
          <div className="card-heading">
            <h2>At the counter</h2>
          </div>
          {called ? (
            <>
              <p className="counter-number">#{called.number}</p>
              <button className="primary" disabled={busy} onClick={() => update(`/tickets/${called.number}/serve`)}>Mark served</button>
            </>
          ) : (
            <>
              <p className="counter-empty">No one at the counter</p>
              <button className="primary" disabled={busy || loading || waiting.length === 0} onClick={() => update('/queue/call-next')}>Call next</button>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-heading">
            <h2>Waiting</h2>
            <span className="count">{waiting.length}</span>
          </div>
          {loading ? <p className="empty">Loading queue...</p> : waiting.length === 0 ? <p className="empty">No tickets waiting.</p> : (
            <ol className="queue-list">
              {waiting.map((ticket, index) => (
                <li key={ticket.number}>
                  <span>
                    Ticket #{ticket.number}
                    {index === 0 && <span className="tag">Next</span>}
                  </span>
                  <button className="cancel" disabled={busy} onClick={() => cancel(ticket.number)}>Cancel</button>
                </li>
              ))}
            </ol>
          )}
          <button className="add-ticket" disabled={busy} onClick={() => update('/queue/walk-in')}>+ Add walk-in ticket</button>
        </div>
      </div>
    </section>
  );
}
