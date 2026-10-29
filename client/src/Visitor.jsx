import React, { useEffect, useState } from 'react';
import { request } from './api.js';

const storageKey = 'queuedesk-ticket';

export default function Visitor() {
  const [number, setNumber] = useState(() => localStorage.getItem(storageKey) || '');
  const [ticket, setTicket] = useState(null);
  const [code, setCode] = useState('');
  const [lookup, setLookup] = useState('');
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

  async function findTicket(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await request(`/tickets/${encodeURIComponent(lookup)}`);
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
    setLookup('');
    setError('');
  }

  if (number) {
    return (
      <section>
        <h2>{ticket?.status === 'served' ? 'Your visit is complete' : 'Your ticket'}</h2>
        <p>Keep your ticket number to check your status later.</p>
        {error && <p className="error" role="alert">{error}</p>}
        {ticket ? <TicketView ticket={ticket} /> : !error && <p>Loading your ticket...</p>}
        <button type="button" onClick={leaveTicket}>Back to queue entry</button>
      </section>
    );
  }

  return (
    <section>
      <h2>Join the queue</h2>
      <p>Enter the code shared at the venue.</p>
      <form onSubmit={join}>
        <label htmlFor="code">Queue access code</label>
        <div className="form-row">
          <input id="code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric" pattern="(?:[0-9]{4}|[0-9]{6})" required placeholder="4- or 6-digit code" autoComplete="off" />
          <button disabled={busy}>{busy ? 'Joining...' : 'Join queue'}</button>
        </div>
      </form>
      <section>
        <h2>Find your ticket</h2>
        <form onSubmit={findTicket}>
          <label htmlFor="ticket-number">Ticket number</label>
          <div className="form-row">
            <input id="ticket-number" value={lookup} onChange={event => setLookup(event.target.value.replace(/\D/g, ''))}
              inputMode="numeric" pattern="[1-9][0-9]*" required placeholder="Ticket number" />
            <button disabled={busy}>Find ticket</button>
          </div>
        </form>
      </section>
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}

function TicketView({ ticket }) {
  return (
    <div aria-live="polite">
      <p>Ticket number: <strong>#{String(ticket.number).padStart(3, '0')}</strong></p>
      {ticket.status === 'waiting' && <p>Position in queue: <strong>{ticket.position}</strong></p>}
      {ticket.status === 'called' && <p><strong>It's your turn. Please come to the counter.</strong></p>}
      {ticket.status === 'served' && <p><strong>Thank you. You have been served.</strong></p>}
    </div>
  );
}
