import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  status: { type: String, enum: ['waiting', 'called', 'served'], default: 'waiting' },
}, { timestamps: true });

// A single queue can have only one ticket at the counter at a time.
ticketSchema.index({ status: 1 }, { unique: true, partialFilterExpression: { status: 'called' } });

const counterSchema = new mongoose.Schema({
  _id: String,
  value: { type: Number, default: 0 },
}, { versionKey: false });

export const Ticket = mongoose.model('Ticket', ticketSchema);
export const Counter = mongoose.model('Counter', counterSchema);
