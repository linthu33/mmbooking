const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController.js');
const roomController = require("../controllers/roomController.js");

const { register, login } = require('../controllers/authController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');
const upload = require('../config/multer.js'); 

// Public routes
router.post('/register', register);
router.post('/login', login);
// Protected routes example
router.get('/admin', protect, authorize('admin'), (req, res) => {
    res.json({ message: 'Welcome Admin', user: req.user });
});

router.get('/user', protect, authorize('user', 'admin'), (req, res) => {
    res.json({ message: 'Welcome User', user: req.user });
});
//booking
router.route('/')
  .get(hotelController.getAllHotels);
router.post('/', upload.array('images', 10), hotelController.createHotel);
router.route('/city/:cityname').get(hotelController.searchHotels)
router.route('/:id')
  .get(hotelController.getHotelById)
  .put(hotelController.updateHotel)
  .delete(hotelController.deleteHotel);
//  
router.post("/ro/create",upload.array('images', 10), roomController.createRoom);
router.get("/ro/getall", roomController.getAllRooms);
router.get("/ro/:id", roomController.getRoomByHotelId);
router.put("/ro/:id", roomController.updateRoom);
router.delete("/ro/:id", roomController.deleteRoom);

module.exports = router;
