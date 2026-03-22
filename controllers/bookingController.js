// controllers/bookingController.js

const Booking = require('../models/Booking');
const BookingUser = require('../models/BookingUser');
const { generateBookingID, generateVoucherCode } = require("../utils/booking.utils");
const { sendBookingEmail, sendSMS } = require("../utils/notify");
const HotelModel = require('../models/Hotel'); 
exports.createBookingUser = async (req, res) => {
  try {
    const user = await BookingUser.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// ============================
// CREATE booking
// ============================
exports.createBooking = async (req, res) => {
  try {
    const data = req.body.booking;
    const userData = req.body.user;  // Incoming bookingUser object
    let savedUser = null;

    // 1) Save BookingUser into DB if provided
    if (userData) {
      savedUser = await BookingUser.create(userData);
      data.user = savedUser._id;
    }

    // 2) Find hotel ObjectId from hotelId string in booking data
    console.log("Finding hotel with ID:", data.hotel);
    const hotelDoc = await HotelModel.findOne({ hotel_id: data.hotel });
    console.log("Hotel found:", hotelDoc);
    if (!hotelDoc) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }
    data.hotel = hotelDoc._id; // Replace with ObjectId

    // 3) Booking ID + Voucher Generate
    const bookingId = generateBookingID();
    const voucher = generateVoucherCode();

    // 4) Save Booking with user FK
    const newBooking = await Booking.create({
      ...data,
      booking_id: bookingId,
      voucher_code: voucher,
    });
    console.log("New booking created:", newBooking);
    // 5) Send Email + SMS (optional)
    await sendBookingEmail(userData.email, bookingId, voucher);
    await sendSMS("0940000000", bookingId);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: newBooking,
    });

  } catch (err) {
    console.error("Booking create error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
// ============================
// READ all bookings
// ============================
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('hotel', 'name')
      .populate('rooms', 'name');
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// READ single booking by ID
// ============================
exports.getBookingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ user: userId })
      .populate('user', 'username email')
      .populate('hotel', 'name')
      .populate('rooms', 'name');  // FIXED: rooms array

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found for this user",
      });
    }

    res.status(200).json({
      success: true,
      data: bookings,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================
// UPDATE booking
// ============================
exports.updateBooking = async (req, res) => {
  try {
    const data = req.body.booking ? req.body.booking : req.body;
    // optionally prevent changing user/hotel/room if you want
    const updated = await Booking.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================
// DELETE booking
// ============================
exports.deleteBooking = async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
