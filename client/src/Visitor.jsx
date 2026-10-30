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
      <section className="card ticket-card" aria-live="polite">
        {error ? <p className="error" role="alert">Could not update your position. Trying again...</p>
          : ticket ? <TicketView ticket={ticket} /> : <p className="muted">Loading your position...</p>}
        {(ticket?.status === 'served' || ticket?.status === 'cancelled' || error) && (
          <button type="button" onClick={leaveTicket}>Back to queue entry</button>
        )}
      </section>
    );
  }

  return (
    <>
      <section className="card">
        <h1>Join the queue</h1>
        <p className="lead">Enter the code shown at the desk to get a ticket. You can wait anywhere nearby.</p>

        <form className="join-form" onSubmit={join}>
          <label htmlFor="code">Access code</label>
          <div className="form-row">
            <input id="code" className="code-input" value={code}
              onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric" pattern="(?:[0-9]{4}|[0-9]{6})" required autoComplete="off"
              aria-describedby="code-hint" />
            <button className="primary" disabled={busy}>{busy ? 'Joining...' : 'Join'}</button>
          </div>
          <p id="code-hint" className="hint">4 or 6 digits</p>
        </form>
        {error && <p className="error" role="alert">{error}</p>}
      </section>

      <section className="how-it-works">
        <h2>How it works</h2>
        <ol className="steps">
          <li><strong>Enter the code</strong><span>Ask the staff if you don't have it.</span></li>
          <li><strong>Watch your place</strong><span>This page updates on its own.</span></li>
          <li><strong>Come to the counter</strong><span>We'll tell you when it's your turn.</span></li>
        </ol>
      </section>
    </>
  );
}

function TicketView({ ticket }) {
  return (
    <>
      <div className="ticket-top">
        <span className="ticket-number">Ticket #{ticket.number}</span>
        <span className={`badge ${ticket.status}`}>{ticket.status}</span>
      </div>

      {ticket.status === 'waiting' && (
        <>
          <p className="position">{ticket.position}</p>
          <h1>Your position</h1>
          <p className="lead">
            {ticket.position === 1 ? "You're next. Please stay close to the counter." : 'Please wait nearby. This page updates on its own.'}
          </p>
        </>
      )}
      {ticket.status === 'called' && (
        <>
          <div className="status-icon called" aria-hidden="true">!</div>
          <h1>It's your turn</h1>
          <p className="lead">Please come to the counter.</p>
        </>
      )}
      {ticket.status === 'served' && (
        <>
          <div className="status-icon served" aria-hidden="true">&#10003;</div>
          <h1>Thank you</h1>
          <p className="lead">You have been served.</p>
        </>
      )}
      {ticket.status === 'cancelled' && (
        <>
          <div className="status-icon cancelled" aria-hidden="true">&#10005;</div>
          <h1>Ticket cancelled</h1>
          <p className="lead">Please ask the staff if you still need help.</p>
        </>
      )}
    </>
  );
}
