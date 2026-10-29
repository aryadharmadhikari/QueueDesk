import { useEffect, useState } from 'react';
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
      <section className="content ticket-page">
        <p className="eyebrow"><span className="dot" /> Your place in line</p>
        <h1>{ticket?.status === 'served' ? 'Your visit is complete.' : "You're in the queue."}</h1>
        <p className="intro">{ticket?.status === 'served' ? 'Your ticket has been marked as served.' : 'Keep this page open or return later to check your status.'}</p>
        {error && <p className="notice error" role="alert">{error}</p>}
        {ticket ? <TicketView ticket={ticket} /> : !error && <p className="notice">Loading your ticket...</p>}
        <button className="text-button" onClick={leaveTicket}>Back to queue entry <span aria-hidden="true">→</span></button>
      </section>
    );
  }

  return (
    <section className="content join-page">
      <p className="eyebrow"><span className="dot" /> A simpler way to wait</p>
      <h1>Your time is<br /><em>yours again.</em></h1>
      <p className="intro">Join the queue, see your place, and come back when you're called.</p>
      <form className="join-form" onSubmit={join}>
        <label htmlFor="code">Queue access code</label>
        <p className="field-hint">Enter the 4- or 6-digit code shared at the venue.</p>
        <div className="form-row">
          <input id="code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric" pattern="(?:[0-9]{4}|[0-9]{6})" required placeholder="Enter code" autoComplete="off" />
          <button className="primary" disabled={busy}>{busy ? 'Joining...' : 'Join queue'} <span aria-hidden="true">→</span></button>
        </div>
      </form>
      <div className="lookup">
        <p>Already have a ticket?</p>
        <form onSubmit={findTicket} className="lookup-form">
          <label className="sr-only" htmlFor="ticket-number">Ticket number</label>
          <input id="ticket-number" value={lookup} onChange={event => setLookup(event.target.value.replace(/\D/g, ''))}
            inputMode="numeric" pattern="[1-9][0-9]*" required placeholder="Ticket number" />
          <button className="text-button" disabled={busy}>Find ticket <span aria-hidden="true">→</span></button>
        </form>
      </div>
      {error && <p className="notice error" role="alert">{error}</p>}
    </section>
  );
}

function TicketView({ ticket }) {
  const messages = {
    waiting: ['Waiting', 'Your position', 'We will update your place as the queue moves.'],
    called: ['Your turn', "You're up next", 'Please come to the counter now.'],
    served: ['Served', 'Thank you.', "You've been served. Have a great day."],
  };
  const [label, title, description] = messages[ticket.status];
  return (
    <div className={`ticket ticket-${ticket.status}`} aria-live="polite">
      <div className="ticket-top"><span>YOUR TICKET</span><span className="status"><span className="dot" />{label}</span></div>
      <div className="ticket-number">#{String(ticket.number).padStart(3, '0')}</div>
      <div className="ticket-detail">
        <div><p className="ticket-label">{title}</p><p className="ticket-description">{description}</p></div>
        {ticket.status === 'waiting' && <strong className="position">{ticket.position}</strong>}
      </div>
    </div>
  );
}
