const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role, hotel_id: user.hotel_id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Register User
exports.register = async (req, res) => {
  const { username, password, role, email, phone, hotelname, hotel_id } = req.body;
  try {
    // Check if username/email/phone already exists
    const userExists = await User.findOne({ $or: [{ username }, { phone }] });
    if (userExists) return res.status(400).json({ message: "User/email/phone already exists" });

    const user = await User.create({
      username,
      password,
      role,
      email,
      phone,
      hotelname,
      hotel_id
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      hotelname: user.hotelname,
      hotel_id: user.hotel_id,
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login User
exports.login = async (req, res) => {
 const loginId = req.body.username || req.body.email || req.body.phone;
 const password = req.body.password;
  console.log(req.body);
   if (!loginId || !password) {
      return res.status(400).json({ message: "Username or password missing" });
    }
  try {
    const user = await User.findOne({
      $or: [
        { username: loginId },
        { email: loginId },
        { phone: loginId }
      ],
    });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // password check
    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // generate token
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
