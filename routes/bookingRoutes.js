const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// public or protected depending on design
// listing and single retrieval can be protected to logged-in users

// create new booking (user must be authenticated)
router.post('/', bookingController.createBooking);

// get all bookings (admin only perhaps)
router.get('/',bookingController.getAllBookings);

// get single booking
router.get('/:userId', bookingController.getBookingsByUserId);
router.get('/hotelbooking/:hotelId', bookingController.getBookingsByHotelId);
// update booking
router.put('/:id', protect, bookingController.updateBooking);

// delete booking
router.delete('/:id', protect, bookingController.deleteBooking);
//Booking user
router.post('/user', bookingController.createBookingUser);
module.exports = router;
