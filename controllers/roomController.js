// controllers/roomController.js

const Room = require("../models/Room");
const fs = require("fs");
const uploadToImgBB = require("../utils/uploadToImgBB").uploadToImgBB;
const mongoose = require('mongoose');
// ============================
// CREATE room
// ============================
exports.createRoom = async (req, res) => {
  const uploadedFiles = req.files || [];

  try {
    // Build room data from fields
    const imageUploadPromises = uploadedFiles.map((file) =>
      uploadToImgBB(file),
    );
    const imageUrls = await Promise.all(imageUploadPromises);
    const roomData = {
      room_id: req.body.room_id || "",
      hotel_id: req.body.hotel_id || "",
      name: req.body.name || "",
      description: req.body.description || "",
      size_sq_m: parseFloat(req.body.size_sq_m) || 0,
      amenities: req.body.amenities ? JSON.parse(req.body.amenities) : [],
      occupancy: req.body.occupancy
        ? JSON.parse(req.body.occupancy)
        : { adults: 1, children: 0 },
      pricing: req.body.pricing ? JSON.parse(req.body.pricing) : [],
      availability: req.body.availability
        ? JSON.parse(req.body.availability)
        : { available_dates: [] },
      images: imageUrls.map((url) => ({
        url: url,
        caption: "Hotel Image",
      })),
      /*  images: (req.files || []).map(file => ({
    url: `http://localhost:5000/uploads/${file.filename}`.replaceAll('\\', '/'),
    caption: "Room Image",
  })), */
    };
    const room = new Room(roomData);
    await room.save();

    res.status(201).json({ success: true, data: room });
  } catch (err) {
    // Delete uploaded files on error
    uploadedFiles.forEach((file) => {
      fs.unlink(file.path, (e) => {
        if (e) console.error("Failed to delete file:", file.path);
      });
    });
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// ============================
// READ all rooms
// ============================
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();

    res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================
// READ single room by ID
// ============================
exports.getRoomByHotelId = async (req, res) => {
  try {
    const room = await Room.find({ hotel_id: req.params.id });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================
// UPDATE room
// ============================
exports.updateRoom = async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedRoom,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================
// DELETE room
// ============================
exports.deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);

    if (!deletedRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ရက်စွဲ ၂ ခုကြားက Dates အားလုံးကို Array ထုတ်ပေးမယ့် function
const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  let curr = new Date(startDate);
  const last = new Date(endDate);

  while (curr <= last) {
    // Date တစ်ခုချင်းစီကို UTC format အတိုင်း ညှိမယ်
    let d = new Date(curr);

    // Database ထဲက format အတိုင်း 17:30:00.000Z ဖြစ်အောင် အသေသတ်မှတ်ခြင်း
    d.setUTCHours(17, 30, 0, 0);

    dates.push(new Date(d));

    // နောက်တစ်ရက်ကို ကူးမယ်
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};


exports.updateRoomAvailability = async (req, res) => {
  try {
    // ၁။ Request Body ထဲက Data တွေကို ဆွဲထုတ်မယ်
    const { checkin, checkout, rooms } = req.body.bookingData;

    // Validation စစ်ဆေးမယ်
    if (!checkout || !rooms || rooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required information (checkout date or rooms).",
      });
    }

    // ၂။ Checkout date ကို Database format အတိုင်း (17:30 UTC) ညှိမယ်
    // $date object ပါလာရင်ယူမယ်၊ မပါရင် string အတိုင်းယူမယ်
    const rawCheckout = checkout.$date || checkout;
    const newCheckOutDate = new Date(rawCheckout);
    newCheckOutDate.setUTCHours(17, 30, 0, 0);

    // ၃။ Room ရဲ့ available_dates index 0 ကို Update လုပ်မယ်
    // Room တစ်ခုထက်ပိုရင် loop ပတ်ဖို့လိုပါမယ်၊ အခုကတော့ ပထမဆုံးတစ်ခုကိုပဲ ပြင်ထားပါတယ်
    const roomId = rooms[0].$oid || rooms[0];

    const result = await Room.updateOne(
      { _id: new mongoose.Types.ObjectId(roomId) },
      { 
        $set: { 
          "availability.available_dates.0": newCheckOutDate 
        } 
      }
    );

    // ၄။ Update ဖြစ်မဖြစ် စစ်ဆေးပြီး Response ပြန်မယ်
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Room's first available date updated successfully!",
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Error updating availability:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
