const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const fs = require('fs');
const uploadToImgBB = require("../utils/uploadToImgBB").uploadToImgBB;
// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Public
exports.createHotel = async (req, res) => {
  const uploadedFiles = req.files || [];

  try {
    const imageUploadPromises = uploadedFiles.map(file => uploadToImgBB(file));
    const imageUrls = await Promise.all(imageUploadPromises);
    // Build hotel data from fields
    const hotelData = {
      hotel_id: Date.now().toString(),
      name: req.body.name,
      description: req.body.description,
      location: {
        country: req.body.country,
        city: req.body.city,
        address: req.body.address,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
      },
      rating: { star: 5, guest_score: 0, total_reviews: 0 },
      facilities: JSON.parse(req.body.facilities || "{}"),
      policy: JSON.parse(req.body.policy || "{}"),
      images: imageUrls.map(url => ({
        url: url,
        caption: "Hotel Image"
      }))
    };

    const hotel = new Hotel(hotelData);
    await hotel.save();

    res.status(201).json({ success: true, data: hotel });
  } catch (err) {
    // Delete uploaded files on error
    uploadedFiles.forEach(file => {
      fs.unlink(file.path, (e) => {
        if (e) console.error("Failed to delete file:", file.path);
      });
    });
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};
// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public

exports.getHotelsSearch = async (req, res) => {
  try {
    const cname = req.params.cityname;

    // 1. Get hotels in that city
    const hotels = await Hotel.find({ "location.city": cname })
      .sort({ "rating.star": 1 })
      .select({ name: 1, hotel_id: 1 });

    // If no hotels, return empty
    if (hotels.length === 0) {
      return res.json({
        success: true,
        data: {
          hotels: [],
          rooms: [],
        },
      });
    }

    // 2. Extract hotel IDs from array
    const hotelIds = hotels.map((h) => h.hotel_id);

    // 3. Get rooms for all hotels
    const rooms = await Room.find({ hotel_id: { $in: hotelIds } });

    return res.json({
      success: true,
      data: {
        hotels,
        rooms,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.getHotelsWithRooms = async (req, res) => {
  try {
    const cityName = req.params.cityname;
    console.log("hello");
    const hotelsWithRooms = await Hotel.aggregate([
      // 1️⃣ Filter hotels by city
      { $match: { "location.city": cityName } },

      // 2️⃣ Join Room collection
      {
        $lookup: {
          from: "rooms", // Room collection name in MongoDB
          localField: "hotel_id", // Hotel field
          foreignField: "hotel_id", // Room field
          as: "rooms",
        },
      },

      // 3️⃣ Only hotels that have at least 1 room
      { $match: { "rooms.0": { $exists: true } } },

      // 4️⃣ Optional: Sort by rating (ascending)
      { $sort: { "rating.star": 1 } },
    ]);

    return res.json({
      success: true,
      message: `Hotels with rooms in ${cityName}`,
      data: hotelsWithRooms,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// @desc    Get hotel by id
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Public
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Public
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json({ message: "Hotel deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* 
 exports.searchHotels = async (req, res) => {
  try {
    const cityName = req.params.cityname;
    // အချိန်အပိုင်းအခြားကို ညှိရန် (Time normalization)
    const start = new Date(req.query.start);
    start.setUTCHours(0, 0, 0, 0);
    
    const end = new Date(req.query.end);
    end.setUTCHours(23, 59, 59, 999);

    console.log("Searching hotels in city:", cityName, "from", start, "to", end);

    const results = await Hotel.aggregate([
      {
        $match: {
          "location.city": { $regex: cityName, $options: "i" }
        }
      },
      {
        $lookup: {
          from: "rooms",
          localField: "hotel_id",
          foreignField: "hotel_id",
          as: "rooms"
        }
      },
      {
        $addFields: {
          rooms: {
            $filter: {
              input: "$rooms",
              as: "r",
              cond: {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: "$$r.availability.available_dates",
                        as: "d",
                        cond: {
                          // နည်းလမ်း (၂) - Range ထဲမှာ တစ်ရက်ပါတာနဲ့ ယူမယ်
                          $and: [
                            { $gte: ["$$d", start] },
                            { $lte: ["$$d", end] }
                          ]
                        }
                      }
                    }
                  },
                  0 // အနည်းဆုံး ၁ ရက် အားရင် ရပြီ
                ]
              }
            }
          }
        }
      },
      // အခန်းအားရှိသော ဟိုတယ်များသာ ပြရန်
      { $match: { "rooms.0": { $exists: true } } },
      {
        $project: {
          _id: 0,
          hotel_id: 1,
          name: 1,
          images: 1,
          location: 1,
          rating: 1,
          rooms: 1
        }
      }
    ]);

    res.json({
      success: true,
      count: results.length,
      message: "Found hotels with availability in this range",
      data: results
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 


 */

exports.getAllHotels = async (req, res) => {
  try {
    console.log("Getting all hotels with rooms...");
    const results = await Hotel.aggregate([
      // Join rooms
      {
        $lookup: {
          from: "rooms",
          localField: "hotel_id",
          foreignField: "hotel_id",
          as: "rooms"
        }
      },

      // Only include hotels with at least one room
      { $match: { "rooms.0": { $exists: true } } },
// Sort by rating (DESC)
      { $sort: { rating: -1 } },
      // Select fields
      {
        $project: {
          _id: 0,
          hotel_id: 1,
          name: 1,
          images: 1,
          location: 1,
          rating: 1,
          rooms: 1
        }
      }
    ]);

    res.json({
      success: true,
      message: "All hotels retrieved",
      data: results
    });

  } catch (error) {
    console.error("Get all hotels error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchHotels = async (req, res) => {
  try {
    const cityName = req.params.cityname;

    // Normalize user search dates (start/end of day)
    const start = new Date(req.query.start);
    start.setHours(0, 0, 0, 0);

    const end = new Date(req.query.end);
    end.setHours(23, 59, 59, 999);

    const results = await Hotel.aggregate([
      // Match city
      {
        $match: { "location.city": { $regex: cityName, $options: "i" } }
      },

      // Join rooms
      {
        $lookup: {
          from: "rooms",
          localField: "hotel_id",
          foreignField: "hotel_id",
          as: "rooms"
        }
      },

      // Filter rooms based on overlap
      {
        $addFields: {
          rooms: {
            $filter: {
              input: "$rooms",
              as: "room",
              cond: {
                $and: [
                  // DB start <= user end
                  {
                    $lte: [
                      { $toDate: { $arrayElemAt: ["$$room.availability.available_dates", 0] } },
                      end
                    ]
                  },
                  // DB end >= user start
                  {
                    $gte: [
                      { $toDate: { $arrayElemAt: ["$$room.availability.available_dates", 1] } },
                      start
                    ]
                  }
                ]
              }
            }
          }
        }
      },

      // Keep hotels with at least one room available
      { $match: { "rooms.0": { $exists: true } } },

      // Projection
      {
        $project: {
          _id: 0,
          hotel_id: 1,
          name: 1,
          images: 1,
          location: 1,
          rating: 1,
          rooms: 1
        }
      }
    ]);
 console.log(results.length)
    res.json({ success: true, message: "Found hotels with availability in this range", data: results });

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 



//old create local hotel image without imgbb
/*
exports.createHotel = async (req, res) => {
  const uploadedFiles = req.files || [];

  try {
    const imageUploadPromises = uploadedFiles.map(file => uploadToImgBB(file));
    const imageUrls = await Promise.all(imageUploadPromises);
    // Build hotel data from fields
    const hotelData = {
      hotel_id: Date.now().toString(),
      name: req.body.name,
      description: req.body.description,
      location: {
        country: req.body.country,
        city: req.body.city,
        address: req.body.address,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
      },
      rating: { star: 5, guest_score: 0, total_reviews: 0 },
      facilities: JSON.parse(req.body.facilities || "{}"),
      policy: JSON.parse(req.body.policy || "{}"),
      images: uploadedFiles.map(file => ({
        url: `http://localhost:5000/uploads/${file.filename}`.replaceAll('\\', '/'),
        caption: "Hotel Image"
      }))
    };

    const hotel = new Hotel(hotelData);
    await hotel.save();

    res.status(201).json({ success: true, data: hotel });
  } catch (err) {
    // Delete uploaded files on error
    uploadedFiles.forEach(file => {
      fs.unlink(file.path, (e) => {
        if (e) console.error("Failed to delete file:", file.path);
      });
    });
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};*/