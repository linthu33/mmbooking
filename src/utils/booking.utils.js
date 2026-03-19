// utils/booking.utils.js

exports.generateBookingID = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `BK-${Date.now()}-${random}`;
};

exports.generateVoucherCode = () => {
  return "VC-" + Math.random().toString(36).substring(2, 10).toUpperCase();
};