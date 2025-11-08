const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  companies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }],
  note: String
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
