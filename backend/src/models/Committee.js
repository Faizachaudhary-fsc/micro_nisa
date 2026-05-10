import mongoose from 'mongoose';

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
  trustScore: { type: Number, default: 0 },
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

// Auto-generate invite code before saving
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

export default mongoose.model('Committee', committeeSchema);