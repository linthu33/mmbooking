const mongoose = require('mongoose');

const BookingUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    specialrequests: {
      type: String,
      default: ""
    },
    hotel_id: {
      type: String,
      
    },
    bookingpoint: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookingUser", BookingUserSchema);