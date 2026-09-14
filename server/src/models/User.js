import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: ''
    },
    avatarType: {
      type: String,
      enum: ['svg', 'custom', 'default'],
      default: 'default'
    },
    phone: {
      type: String,
      default: ''
    },
    nationality: {
      type: String,
      default: 'Indian'
    },
    passportNumber: {
      type: String,
      default: ''
    },
    dateOfBirth: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      default: 'Not specified'
    },
    bio: {
      type: String,
      default: ''
    },
    frequentFlyer: {
      type: String,
      default: ''
    },
    irctcUserId: {
      type: String,
      default: ''
    },
    savedTravelers: {
      type: Array,
      default: []
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
