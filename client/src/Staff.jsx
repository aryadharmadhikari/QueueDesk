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
    <section>
      <h2>Staff desk</h2>
      {error && <p className="error" role="alert">{error}</p>}
      <h3>At the counter</h3>
      {called ? (
        <>
          <p>Ticket #{called.number}</p>
          <button className="primary" disabled={busy} onClick={() => update(`/tickets/${called.number}/serve`)}>Mark served</button>
        </>
      ) : (
        <>
          <p>No ticket is being served.</p>
          <button className="primary" disabled={busy || loading || waiting.length === 0} onClick={() => update('/queue/call-next')}>Call next</button>
        </>
      )}
      <h3>Waiting queue</h3>
      {loading ? <p>Loading queue...</p> : waiting.length === 0 ? <p>No tickets waiting.</p> : (
        <ol>{waiting.map(ticket => <li key={ticket.number}>Ticket #{ticket.number}</li>)}</ol>
      )}
    </section>
  );
}
