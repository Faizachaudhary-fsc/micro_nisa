import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Generate OTP (simulated)
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number required' });
    }
    
    // In production, integrate with SMS service
    const otp = '123456'; // Mock OTP
    console.log(`OTP for ${phone}: ${otp}`);
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP and login/register
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    
    if (otp !== '123456') {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    let user = await User.findOne({ phone });
    
    if (!user) {
      // Auto-register new user
      user = new User({
        name: name || `User_${phone.slice(-4)}`,
        phone: phone
      });
      await user.save();
    }
    
    user.lastActive = new Date();
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        trustScore: user.trustScore,
        language: user.language
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token middleware
export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = verified.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name },
      { new: true }
    ).select('-__v');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;