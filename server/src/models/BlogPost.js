import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    excerpt: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    readTime: {
      type: String,
      default: '5 min read'
    },
    category: {
      type: String,
      enum: ['adventure', 'cultural', 'beach', 'city', 'food', 'photography'],
      default: 'adventure'
    }
  },
  { timestamps: true }
);

export default mongoose.model('BlogPost', blogPostSchema);
