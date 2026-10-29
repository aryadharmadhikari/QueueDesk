import React, { useEffect, useState } from 'react';
import { request } from './api.js';

const storageKey = 'queuedesk-ticket';

export default function Visitor() {
  const [number, setNumber] = useState(() => localStorage.getItem(storageKey) || '');
  const [ticket, setTicket] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!number) return undefined;
    let active = true;
    async function load() {
      try {
        const data = await request(`/tickets/${encodeURIComponent(number)}`);
        if (active) {
          setTicket(data);
          setError('');
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    }
    load();
    const timer = setInterval(load, 5000);
    return () => { active = false; clearInterval(timer); };
  }, [number]);

  function rememberTicket(value) {
    localStorage.setItem(storageKey, String(value));
    setTicket(null);
    setError('');
    setNumber(String(value));
  }

  async function join(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await request('/tickets', { method: 'POST', body: JSON.stringify({ code }) });
      rememberTicket(data.number);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function leaveTicket() {
    localStorage.removeItem(storageKey);
    setNumber('');
    setTicket(null);
    setCode('');
    setError('');
  }

  if (number) {
    return (
      <section>
        {error ? <p className="error" role="alert">Could not update your position. Trying again...</p>
          : ticket ? <TicketView ticket={ticket} /> : <p>Loading your position...</p>}
        {(ticket?.status === 'served' || error) && (
          <button type="button" onClick={leaveTicket}>Back to queue entry</button>
        )}
      </section>
    );
  }

  return (
    <section>
      <h2>Join the queue</h2>
      <form onSubmit={join}>
        <label htmlFor="code">Access code (4 or 6 digits)</label>
        <div className="form-row">
          <input id="code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric" pattern="(?:[0-9]{4}|[0-9]{6})" required autoComplete="off" />
          <button className="primary" disabled={busy}>{busy ? 'Joining...' : 'Join'}</button>
        </div>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}

function TicketView({ ticket }) {
  return (
    <div aria-live="polite">
      {ticket.status === 'waiting' && <><h2>Your position</h2><p className="position">{ticket.position}</p></>}
      {ticket.status === 'called' && <><h2>It's your turn</h2><p>Please come to the counter.</p></>}
      {ticket.status === 'served' && <><h2>Thank you</h2><p>You have been served.</p></>}
      <p>Ticket #{ticket.number}</p>
    </div>
  );
}
