import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  language: {
    type: String,
    enum: ['ur', 'en'],
    default: 'ur'
  },
  trustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  profilePicture: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to update trust score
userSchema.methods.updateTrustScore = async function() {
  const Committee = mongoose.model('Committee');
  const committees = await Committee.find({ members: this._id });
  
  let totalPayments = 0;
  let onTimePayments = 0;
  
  committees.forEach(committee => {
    const userPayment = committee.payments.find(p => p.userId.toString() === this._id.toString());
    if (userPayment) {
      totalPayments++;
      if (userPayment.status === 'paid' && new Date(userPayment.paidDate) <= new Date(userPayment.dueDate)) {
        onTimePayments++;
      }
    }
  });
  
  if (totalPayments > 0) {
    this.trustScore = Math.floor((onTimePayments / totalPayments) * 100);
    await this.save();
  }
  
  return this.trustScore;
};

export default mongoose.model('User', userSchema);
