// controllers/roomController.js

const Room = require("../models/room");
const fs = require('fs');
// ============================
// CREATE room
// ============================
exports.createRoom = async (req, res) => {
  const uploadedFiles = req.files || [];

  try {
    // Build room data from fields
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
  images: (req.files || []).map(file => ({
    url: `http://localhost:5000/uploads/${file.filename}`.replaceAll('\\', '/'),
    caption: "Room Image",
  })),
};
    const room = new Room(roomData);
    await room.save();

    res.status(201).json({ success: true, data: room });
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

// ============================
// READ all rooms
// ============================
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();

    res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================
// READ single room by ID
// ============================
exports.getRoomByHotelId = async (req, res) => {
  try {
    const room = await Room.find({hotel_id:req.params.id});

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================
// UPDATE room
// ============================
exports.updateRoom = async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    res.status(200).json({
      success: true,
      data: updatedRoom
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
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
        message: "Room not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Room deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};