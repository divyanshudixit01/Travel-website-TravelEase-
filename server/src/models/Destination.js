import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    location: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['beach', 'mountain', 'heritage', 'city', 'luxe'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      default: 4.8
    },
    image: {
      type: String,
      required: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    highlights: [String]
  },
  { timestamps: true }
);

export default mongoose.model('Destination', destinationSchema);
