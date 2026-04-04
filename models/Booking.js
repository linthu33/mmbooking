
const mongoose = require('mongoose');
const PaymentStatusSchema = new mongoose.Schema({
  method: { type: String, enum: ["online_payment", "pay_at_hotel", "deposit"], required: true },
  method_label: { type: String },

  code: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Refunded", "Cancelled"],
    default: "Pending"
  },
  description: { type: String },

  actions: {
    retry_allowed: Boolean,
    auto_cancel: Boolean
  },
  cardHolderName: String,
  cardNumber: String,
  expiryDate: String,
  cvv: String,
  cardType: String
});

const BookingStatusSchema = new mongoose.Schema({
  code: {
    type: String,
    enum: ["Pending", "Confirmed", "CheckedIn", "CheckedOut", "Cancelled", "NoShow"],
    default: "Pending"
  },
  description: String,
  workflow: {
    booking_id_generated: Boolean,
    voucher_generated: Boolean,
    notification_sent: Boolean
  }
});

const BookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "BookingUser", required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true }],
    room_nights: { type: Map, of: Number, required: true },
    hotelgenId:{type:String},
    checkin: { type: Date, required: true },
    checkout: { type: Date, required: true },

    adults: Number,
    children: Number,

    subtotal_all_rooms: Number,
    tax_total: Number,
    discount_total: Number,
    grand_total: Number,
    currency: String,

    booking_id: String,
    voucher_code: String,

    payment_status: PaymentStatusSchema,
    booking_status: BookingStatusSchema
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);