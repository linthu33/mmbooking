// models/Room.js
const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  room_id: {
    type: String,
    required: true,
    unique: true
  },
  hotel_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,

  size_sq_m: {
    type: Number,
    default: null
  },

  images: [
    {
      url: { type: String, required: true },
      caption: { type: String }
    }
  ],

  amenities: [
    {
      type: String
    }
  ],

  occupancy: {
    adults: { type: Number, required: true },
    children: { type: Number, default: 0 }
  },

 pricing: [
  {
    price_per_night: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    breakfast_included: { type: Boolean, default: false },
    taxes_and_fees: { type: Number, default: 0 },
    refundable: { type: Boolean, default: true }
  }
]
,
  availability: {
    available_dates: [
      {
        type: Date // ISO date string: "2026-03-05"
      }
    ]
  },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }
});

module.exports = mongoose.model("Room", RoomSchema);