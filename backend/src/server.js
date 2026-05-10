import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/micro_nisa';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  trustScore: { type: Number, default: 50 },
  language: { type: String, default: 'ur' },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  profileComplete: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// Committee Schema
const committeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameUr: { type: String },
  monthlyAmount: { type: Number, required: true, min: 100 },
  totalMembers: { type: Number, required: true, min: 2, max: 50 },
  duration: { type: Number },
  currentMonth: { type: Number, default: 1 },
  inviteCode: { type: String, unique: true, sparse: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  language: { type: String, enum: ['ur', 'en'], default: 'ur' },
  nextPayoutDate: Date,
  payments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    month: Number,
    amount: Number,
    status: { type: String, enum: ['pending', 'paid', 'late'], default: 'pending' },
    dueDate: Date,
    paidDate: Date,
    transactionId: String
  }],
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate invite code
committeeSchema.pre('save', async function(next) {
  if (!this.inviteCode) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.inviteCode = code;
  }
  next();
});

const Committee = mongoose.model('Committee', committeeSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['payment_due', 'payment_received', 'payout', 'invite'], required: true },
  title: String,
  titleUr: String,
  message: String,
  messageUr: String,
  isRead: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

// Auth middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'micronisa_secret_key_2025');
    req.userId = verified.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ AUTH ROUTES ============
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number required' });
    }
    const otp = '123456';
    console.log(`OTP for ${phone}: ${otp}`);
    res.json({ success: true, message: 'OTP sent successfully', otp: '123456' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    
    if (otp !== '123456') {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    let user = await User.findOne({ phone });
    
    if (!user) {
      user = new User({
        name: name || `User_${phone.slice(-4)}`,
        phone: phone,
        profileComplete: !!name
      });
      await user.save();
    }
    
    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET || 'micronisa_secret_key_2025',
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

app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/auth/update-profile', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, profileComplete: true },
      { new: true }
    ).select('-__v');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ COMMITTEE ROUTES ============
app.get('/api/committees', verifyToken, async (req, res) => {
  try {
    const committees = await Committee.find({
      members: req.userId,
      status: 'active'
    }).populate('createdBy', 'name phone');
    res.json(committees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/committees', verifyToken, async (req, res) => {
  try {
    const { name, nameUr, monthlyAmount, totalMembers, duration, language } = req.body;
    
    if (!name || !monthlyAmount || !totalMembers) {
      return res.status(400).json({ error: 'Name, monthly amount, and total members are required' });
    }
    
    const committee = new Committee({
      name,
      nameUr: nameUr || name,
      monthlyAmount,
      totalMembers,
      duration: duration || totalMembers,
      createdBy: req.userId,
      members: [req.userId],
      status: 'active',
      language: language || 'ur',
      payments: []
    });
    
    // Generate payments
    const totalDuration = duration || totalMembers;
    for (let month = 1; month <= totalDuration; month++) {
      committee.payments.push({
        userId: req.userId,
        month: month,
        amount: monthlyAmount,
        dueDate: new Date(Date.now() + (month * 30 * 24 * 60 * 60 * 1000)),
        status: 'pending'
      });
    }
    
    committee.nextPayoutDate = new Date(Date.now() + (totalDuration * 30 * 24 * 60 * 60 * 1000));
    
    await committee.save();
    
    console.log('✅ Committee created with invite code:', committee.inviteCode);
    res.status(201).json(committee);
  } catch (error) {
    console.error('Error creating committee:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/committees/join', verifyToken, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    const committee = await Committee.findOne({ 
      inviteCode: inviteCode.toUpperCase(),
      status: 'active'
    });
    
    if (!committee) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }
    
    if (committee.members.includes(req.userId)) {
      return res.status(400).json({ error: 'Already a member' });
    }
    
    if (committee.members.length >= committee.totalMembers) {
      return res.status(400).json({ error: 'Committee is full' });
    }
    
    committee.members.push(req.userId);
    
    for (let month = committee.currentMonth; month <= committee.duration; month++) {
      committee.payments.push({
        userId: req.userId,
        month: month,
        amount: committee.monthlyAmount,
        dueDate: new Date(Date.now() + (month - committee.currentMonth + 1) * 30 * 24 * 60 * 60 * 1000),
        status: 'pending'
      });
    }
    
    await committee.save();
    res.json(committee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/committees/:committeeId/pay', verifyToken, async (req, res) => {
  try {
    const { committeeId } = req.params;
    const { month } = req.body;
    
    const committee = await Committee.findById(committeeId);
    
    if (!committee) {
      return res.status(404).json({ error: 'Committee not found' });
    }
    
    const payment = committee.payments.find(
      p => p.userId.toString() === req.userId && p.month === month
    );
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (payment.status === 'paid') {
      return res.status(400).json({ error: 'Payment already made' });
    }
    
    payment.status = 'paid';
    payment.paidDate = new Date();
    
    await committee.save();
    
    const user = await User.findById(req.userId);
    const userPayments = committee.payments.filter(p => p.userId.toString() === req.userId);
    const paidPayments = userPayments.filter(p => p.status === 'paid');
    user.trustScore = Math.min(100, Math.floor((paidPayments.length / userPayments.length) * 100));
    await user.save();
    
    res.json({ success: true, payment, trustScore: user.trustScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});