const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  country: String,
  city: String,
  address: String,
  latitude: Number,
  longitude: Number,
});

const imageSchema = new mongoose.Schema({
  url: String,
  caption: String,
});

const ratingSchema = new mongoose.Schema({
  star: Number,
  guest_score: Number,
  total_reviews: Number,
});

const facilitiesSchema = new mongoose.Schema({
  general: [String],
  wellness: [String],
  pool: Boolean,
  pets_allowed: Boolean,
});

const policySchema = new mongoose.Schema({
  checkin: String,
  checkout: String,
  cancellation: String,
});

const hotelSchema = new mongoose.Schema({
  hotel_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  location: locationSchema,
  images: [imageSchema],
  rating: ratingSchema,
  facilities: facilitiesSchema,
  policy: policySchema,
  
}, { timestamps: true });


hotelSchema.index({ "location.city": 1 });
hotelSchema.index({ "rating.star": 1 });
module.exports = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);
