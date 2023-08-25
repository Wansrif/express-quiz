import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { createAccessToken } from '../utils/generateToken.js';

const authController = {
  signup: async (req, res) => {
    try {
      const { username, phone, password } = req.body;

      const errors = [];

      if (!username) errors.push({ message: 'Username is required' });
      const findUsername = await User.findOne({ username });
      if (username && findUsername) errors.push({ message: 'Username already exists' });

      if (!phone) errors.push({ message: 'Phone is required' });
      const validatePhone = /^\d+$/.test(phone);
      if (phone && !validatePhone) errors.push({ message: 'Phone number is not valid' });
      if ((validatePhone && phone.length < 5) || phone.length > 13)
        errors.push({ message: "Phone number's length must be between 5 and 13" });

      if (!password) errors.push({ message: 'Password is required' });
      if (password && password.length < 6) errors.push({ message: 'Password must be at least 6 characters' });

      if (errors.length > 0) return res.status(400).json({ errors });

      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        phone,
        password: passwordHash,
      });

      await newUser.save();

      res.json({
        status: 'success',
        status_code: 200,
        message: 'Signup successfully!',
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  login: async (req, res) => {
    try {
      // if (req.cookies.accesstoken) return res.status(400).json({ message: 'You are already logged in' });

      const { username, password } = req.body;

      const user = await User.findOne({ username });
      if (!user) return res.status(400).json({ message: 'Authentication failed. Please check your credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Authentication failed. Please check your credentials' });

      const accesstoken = createAccessToken({
        id: user._id,
        name: user.username,
      });

      res.cookie('accesstoken', accesstoken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
      });

      res.json({
        status: 'success',
        status_code: 200,
        message: 'Login successfully',
        accesstoken,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie('accesstoken');

      return res.json({
        status: 'success',
        status_code: 200,
        message: 'Logged out',
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
};

export default authController;
