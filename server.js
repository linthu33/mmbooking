const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const path = require('path');
dotenv.config();
const app = express();
// middleware
// Multer upload folder
const uploadFolder = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadFolder));
app.use(express.json());
// Serve uploads folder statically

// routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);

// health check route
app.get('/', (req, res) => {
  res.send('Hotel Booking API is running');
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database', err);
    process.exit(1);
  });
