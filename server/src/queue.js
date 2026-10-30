import { Router } from 'express';
import { Counter, Ticket } from './models.js';

export function queueRoutes(queueCode) {
  const router = Router();

  router.post('/tickets', async (req, res, next) => {
    try {
      if (typeof req.body?.code !== 'string' || req.body.code !== queueCode) {
        return res.status(400).json({ error: 'Enter the correct queue code.' });
      }
      const ticket = await createTicket();
      res.status(201).json({ number: ticket.number });
    } catch (error) {
      next(error);
    }
  });

  // Staff can add a ticket for a visitor who does not have a phone.
  router.post('/queue/walk-in', async (_req, res, next) => {
    try {
      const ticket = await createTicket();
      res.status(201).json({ number: ticket.number });
    } catch (error) {
      next(error);
    }
  });

  router.get('/tickets/:number', async (req, res, next) => {
    try {
      const number = readNumber(req.params.number);
      if (!number) return res.status(400).json({ error: 'Enter a valid ticket number.' });
      const ticket = await Ticket.findOne({ number }).lean();
      if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
      const position = ticket.status === 'waiting'
        ? 1 + await Ticket.countDocuments({ status: 'waiting', number: { $lt: number } })
        : null;
      res.json({ number: ticket.number, status: ticket.status, position });
    } catch (error) {
      next(error);
    }
  });

  router.get('/queue', async (_req, res, next) => {
    try {
      const tickets = await Ticket.find({ status: { $in: ['waiting', 'called'] } })
        .sort({ number: 1 }).select('number status -_id').lean();
      res.json(tickets);
    } catch (error) {
      next(error);
    }
  });

  router.post('/queue/call-next', async (_req, res, next) => {
    try {
      if (await Ticket.exists({ status: 'called' })) {
        return res.status(409).json({ error: 'Mark the current ticket as served first.' });
      }
      const ticket = await Ticket.findOneAndUpdate(
        { status: 'waiting' }, { status: 'called' }, { sort: { number: 1 }, new: true },
      );
      if (!ticket) return res.status(409).json({ error: 'There are no tickets waiting.' });
      res.json({ number: ticket.number, status: ticket.status });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'A ticket is already being served.' });
      }
      next(error);
    }
  });

  router.post('/tickets/:number/serve', async (req, res, next) => {
    try {
      const number = readNumber(req.params.number);
      if (!number) return res.status(400).json({ error: 'Enter a valid ticket number.' });
      const ticket = await Ticket.findOneAndUpdate(
        { number, status: 'called' }, { status: 'served' }, { new: true },
      );
      if (!ticket) return res.status(409).json({ error: 'This ticket is not being served.' });
      res.json({ number: ticket.number, status: ticket.status });
    } catch (error) {
      next(error);
    }
  });

  router.post('/tickets/:number/cancel', async (req, res, next) => {
    try {
      const number = readNumber(req.params.number);
      if (!number) return res.status(400).json({ error: 'Enter a valid ticket number.' });
      const ticket = await Ticket.findOneAndUpdate(
        { number, status: 'waiting' }, { status: 'cancelled' }, { new: true },
      );
      if (!ticket) return res.status(409).json({ error: 'Only waiting tickets can be cancelled.' });
      res.json({ number: ticket.number, status: ticket.status });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

async function createTicket() {
  const counter = await Counter.findByIdAndUpdate(
    'tickets', { $inc: { value: 1 } }, { upsert: true, new: true },
  );
  return Ticket.create({ number: counter.value });
}

function readNumber(value) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}
