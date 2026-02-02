const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  phone: { type: String, sparse: true, default: undefined }, // Removed unique: true to avoid null collisions
  password: { type: String }, // Optional if using OTP only, but good for Admin
  googleId: { type: String, unique: true, sparse: true },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'superadmin'], 
    default: 'user' 
  },
  isActive: { type: Boolean, default: true },
  addresses: [{ 
    street: String, 
    city: String, 
    pin: String 
  }],
}, { timestamps: true });

userSchema.methods.matchPassword = async function(enteredPassword) {
  if(!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
